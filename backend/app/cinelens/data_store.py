"""
Loads the MovieLens 1M dataset, applies the same preprocessing used in the
original notebook (drop outlier users by rating-count, 2 std around median),
and precomputes everything that is reused across requests:

  - the full user x movie rating pivot table
  - an "eligible pool" of all movies with >= MIN_CF_RATINGS ratings (used as
    the Collaborative Filtering candidate pool -- broader than the old top-300,
    covers ~1,000+ titles while still avoiding noisy/obscure movies)
  - a TF-IDF matrix over combined movie Title + Genres text for the
    content-based model (richer than genres-only: captures franchise keywords,
    sequel patterns, and title text alongside genre metadata)

Everything is computed once at startup and cached on the DataStore singleton.
"""
import os
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "ml-1m")

# Minimum number of ratings a movie must have to enter the Collaborative
# Filtering candidate pool. Replaces the old POPULAR_POOL_SIZE=300 cap --
# instead of keeping only the top-N most-rated, we keep every movie that has
# enough ratings to produce a reliable correlation signal.
MIN_CF_RATINGS = 100

# Minimum overlapping ratings required before two movies are considered
# correlated at all (avoids noisy correlations from tiny samples).
MIN_PERIODS = 20


class DataStore:
    def __init__(self):
        self.ratings_raw = pd.read_csv(
            os.path.join(DATA_DIR, "ratings.dat"),
            sep="::",
            engine="python",
            names=["user_id", "movie_id", "rating", "timestamp"],
            encoding="latin-1",
        )
        self.movies = pd.read_csv(
            os.path.join(DATA_DIR, "movies.dat"),
            sep="::",
            engine="python",
            names=["movie_id", "title", "genres"],
            encoding="latin-1",
        )

        merged = pd.merge(self.movies, self.ratings_raw)[["movie_id", "title", "user_id", "rating"]]

        # --- Same outlier-user filter as the original notebook ---
        counts = merged.groupby("user_id").size()
        u, s = np.median(counts), np.std(counts)
        active_users = counts[(counts > u - 2 * s) & (counts < u + 2 * s)].index
        self.ratings = merged[merged["user_id"].isin(active_users)].copy()

        # --- Full user x movie pivot (used for per-user rating history / splits) ---
        self.pivot_full = self.ratings.pivot_table(index="user_id", columns="title", values="rating")

        # --- Movie stats (num_ratings, mean_rating), used to blend final CF score ---
        # Must be computed before the eligible pool block below, which filters on num_ratings.
        self.movie_stats_full = self.ratings.groupby("title").agg(
            num_ratings=("rating", "count"), mean_rating=("rating", "mean")
        )

        # --- Eligible CF pool: all movies with >= MIN_CF_RATINGS ratings ---
        # Replaces the old hard-coded top-300 list. By filtering on a minimum
        # rating threshold rather than a fixed count, we include every movie
        # with a reliable rating signal instead of cutting off mid-list.
        eligible_titles = self.movie_stats_full[
            self.movie_stats_full["num_ratings"] >= MIN_CF_RATINGS
        ].index.tolist()
        self.eligible_titles = eligible_titles          # ~1,000+ movies
        self.pivot_eligible = self.pivot_full[          # user x eligible-movie pivot
            [t for t in eligible_titles if t in self.pivot_full.columns]
        ]

        # Backward-compatible aliases so existing callers keep working while
        # we migrate (popular_titles / pivot_popular now point to the expanded
        # eligible pool instead of the old top-300).
        self.popular_titles = self.eligible_titles
        self.pivot_popular = self.pivot_eligible

        # --- Title <-> movie_id lookup ---
        self.title_to_id = self.movies.set_index("title")["movie_id"].to_dict()
        self.title_to_genres = self.movies.set_index("title")["genres"].to_dict()

        # --- TF-IDF over combined Title + Genres, for the content-based model ---
        # movies.dat genres look like "Animation|Children's|Comedy"
        # Title is cleaned of parentheses: "Toy Story (1995)" -> "Toy Story 1995"
        # Combining both fields captures franchise keywords (e.g. "Star Wars",
        # "Toy Story") and sequel numbering alongside genre labels.
        def _build_corpus(row):
            title_clean = row["title"].replace("(", "").replace(")", "")
            genres_clean = row["genres"].replace("|", " ") if pd.notna(row["genres"]) else ""
            return f"{title_clean} {genres_clean}".strip()

        combined_corpus = self.movies.apply(_build_corpus, axis=1).tolist()
        self.tfidf = TfidfVectorizer(token_pattern=r"[A-Za-z0-9'\-]+")
        self.tfidf_matrix = self.tfidf.fit_transform(combined_corpus)  # (n_movies, vocab)
        self.tfidf_title_order = self.movies["title"].tolist()
        self.title_to_tfidf_row = {t: i for i, t in enumerate(self.tfidf_title_order)}

        self.active_user_ids = sorted(self.ratings["user_id"].unique().tolist())

    def user_rating_count(self, user_id: int) -> int:
        return int(self.ratings[self.ratings.user_id == user_id].shape[0])


# Singleton, built once at process startup.
store = DataStore()
