"""
Single-movie similarity search.

This is the "search a movie, get its top-N most similar movies" feature from
the original notebook this project extends -- distinct from the CF / Content
/ Hybrid comparison in recommenders.py, which is a *per-user* recommender
evaluated with train/test splits. This feature has no user or split: you
pick one movie, and get back the movies most correlated with it across every
user who rated both.

Pipeline:
  1. Reuse the full user x movie pivot table (already built in DataStore).
  2. Pull the ratings column for the selected movie.
  3. Restrict the pivot to only users who rated the target movie (co-raters)
     for a 10-50x speedup, then run `.corrwith()` -> raw Pearson correlation.
  4. Drop movies with no rating overlap (NaN correlation).
  5. Join with each movie's rating count + average rating (precomputed on
     the full dataset -- store.movie_stats_full).
  6. Filter out movies with fewer than `min_ratings` ratings.
  7. Compute TF-IDF genre cosine similarity between the target and every
     candidate movie (reuses store.tfidf_matrix, built at startup).
  8. Blend: final_score = (1 - genre_weight) * pearson + genre_weight * genre_sim
  9. Sort by final_score descending, return the top `k` (default 15).
"""
from typing import List, Optional, TypedDict

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from .data_store import store

DEFAULT_MIN_RATINGS = 100
DEFAULT_TOP_N = 15
SEARCH_RESULT_LIMIT = 10

# Weight given to genre cosine similarity in the blended score.
# 0.0 = pure rating correlation, 1.0 = pure genre similarity.
# Default: 30% genre, 70% rating correlation.
DEFAULT_GENRE_WEIGHT = 0.3


class MovieMatch(TypedDict):
    title: str
    genres: str
    num_ratings: int


class SimilarMovie(TypedDict):
    title: str
    genres: str
    similarity: float        # blended final score
    rating_correlation: float  # raw Pearson correlation (rating signal)
    genre_similarity: float    # cosine similarity on TF-IDF genre vectors
    num_ratings: int
    avg_rating: float


def search_movies(query: str, limit: int = SEARCH_RESULT_LIMIT) -> List[MovieMatch]:
    """Case-insensitive substring search over the movie catalog.

    Only returns movies that exist in the ratings pivot table (i.e. have at
    least one rating), since un-rated movies can never be similarity-scored
    anyway. Ranked by rating count descending, so well-known matches (e.g.
    "Star Wars: Episode IV" for a "star wars" query) surface before obscure
    same-name entries.
    """
    q = query.strip().lower()
    if not q:
        return []

    candidates = store.movies[store.movies["title"].str.lower().str.contains(q, regex=False)]
    if candidates.empty:
        return []

    rows: List[MovieMatch] = []
    for row in candidates.itertuples():
        if row.title not in store.pivot_full.columns:
            continue  # never rated -- can't be searched against or recommended
        num_ratings = int(store.movie_stats_full.loc[row.title, "num_ratings"]) if row.title in store.movie_stats_full.index else 0
        rows.append({"title": row.title, "genres": row.genres, "num_ratings": num_ratings})

    rows.sort(key=lambda r: r["num_ratings"], reverse=True)
    return rows[:limit]


def similar_movies(
    title: str,
    min_ratings: int = DEFAULT_MIN_RATINGS,
    k: int = DEFAULT_TOP_N,
    genre_weight: float = DEFAULT_GENRE_WEIGHT,
) -> Optional[List[SimilarMovie]]:
    """Top-k movies most similar to `title`, blending Pearson rating
    correlation with TF-IDF genre cosine similarity.

    Args:
        title:        Exact movie title (year included). Returns None if not found.
        min_ratings:  Minimum number of ratings a candidate must have.
        k:            Number of results to return.
        genre_weight: Weight [0.0, 1.0] for genre similarity in the blended
                      score. 0.0 = pure rating correlation, 1.0 = pure genre.

    Returns:
        None  — title not found (treat as 404).
        []    — title found but no candidates pass the min_ratings filter.
        [...]  — top-k results sorted by blended similarity score.
    """
    if title not in store.pivot_full.columns:
        return None

    # ------------------------------------------------------------------
    # Step 1: Pearson correlation via co-rater-sliced pivot (fast path)
    # ------------------------------------------------------------------
    target = store.pivot_full[title]
    co_raters = target.dropna().index
    sims = store.pivot_full.loc[co_raters].corrwith(target.loc[co_raters])
    sims = sims.dropna()
    sims = sims.drop(index=title, errors="ignore")

    if sims.empty:
        return []

    df = sims.to_frame("rating_corr").join(store.movie_stats_full, how="inner")
    df = df[df["num_ratings"] >= min_ratings]

    # ------------------------------------------------------------------
    # Step 2: Genre cosine similarity via pre-built TF-IDF matrix
    # ------------------------------------------------------------------
    target_row = store.title_to_tfidf_row.get(title)
    if target_row is not None and genre_weight > 0.0:
        target_vec = store.tfidf_matrix[target_row]  # (1, vocab)

        # Map candidate titles to their TF-IDF row indices
        candidate_titles = df.index.tolist()
        candidate_rows = [
            store.title_to_tfidf_row[t]
            for t in candidate_titles
            if t in store.title_to_tfidf_row
        ]
        valid_titles = [
            t for t in candidate_titles if t in store.title_to_tfidf_row
        ]

        if candidate_rows:
            candidate_vecs = store.tfidf_matrix[candidate_rows]  # (n, vocab)
            genre_scores = cosine_similarity(target_vec, candidate_vecs).flatten()
            import pandas as pd
            genre_series = pd.Series(genre_scores, index=valid_titles, name="genre_sim")
            df = df.join(genre_series, how="left")
        else:
            df["genre_sim"] = 0.0
    else:
        df["genre_sim"] = 0.0

    df["genre_sim"] = df["genre_sim"].fillna(0.0)

    # ------------------------------------------------------------------
    # Step 3: Blend scores and rank
    # Pearson is in [-1, 1]; genre cosine is in [0, 1].
    # Normalise Pearson to [0, 1] via (r + 1) / 2 before blending so both
    # signals are on the same scale, then convert back for display.
    # ------------------------------------------------------------------
    pearson_norm = (df["rating_corr"] + 1.0) / 2.0
    df["blended"] = (1.0 - genre_weight) * pearson_norm + genre_weight * df["genre_sim"]

    df = df.sort_values("blended", ascending=False).head(k)

    results: List[SimilarMovie] = []
    for t, row in df.iterrows():
        results.append(
            {
                "title": t,
                "genres": store.title_to_genres.get(t, ""),
                "similarity": round(float(row["blended"]), 4),
                "rating_correlation": round(float(row["rating_corr"]), 4),
                "genre_similarity": round(float(row["genre_sim"]), 4),
                "num_ratings": int(row["num_ratings"]),
                "avg_rating": round(float(row["mean_rating"]), 2),
            }
        )
    return results
