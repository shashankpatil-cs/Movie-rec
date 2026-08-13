"""
Three recommendation models, all operating on the same MovieLens 1M data:

1. Collaborative Filtering (item-based)
   Movie-movie correlation matrix (Pearson / Spearman / Kendall, selectable),
   computed on the training data only (the evaluation users' held-out test
   ratings are masked out before the matrix is built). Candidate pool is ALL
   movies with >= 100 ratings (expanded from the old top-300 cap), giving
   much broader coverage while still filtering out noisy/obscure titles.
   Candidates are scored by summing centered-rating-weighted similarity to
   everything the user rated in training (see _center_ratings: ratings are
   centered on the scale midpoint of 3, so a 1-2 star rating contributes
   negative weight and suppresses similar candidates instead of weakly
   promoting them), then blended with normalized popularity + average rating
   (60% similarity / 20% rating / 20% popularity).

2. Content-Based Filtering
   TF-IDF vectors over each movie's combined Title + Genres text (upgraded
   from genres-only). A user profile is the centered-rating-weighted sum of
   the TF-IDF vectors of their training-set movies (same centering as above);
   candidates are ranked by cosine similarity to that profile.

3. Hybrid
   CF is scored over the eligible pool (all movies with >= 100 ratings) and
   content is scored over the FULL catalog so the hybrid isn't artificially
   confined to mainstream titles. The two score columns are joined on the
   union of both candidate sets (missing CF score -> 0, missing content
   score -> 0), each min-max normalized over that union, then linearly
   blended (alpha * CF + (1 - alpha) * Content).
"""
from typing import Dict, List, Optional
import numpy as np
import pandas as pd

from .data_store import store, MIN_PERIODS

# ---------------------------------------------------------------------------
# Correlation matrix cache
# build_corr_matrix is expensive (up to ~1,582 x 1,582 Pearson/Spearman/
# Kendall computation). Cache results keyed on (method, frozen user+test set)
# so sequential Pearson / Spearman / Kendall evaluation calls reuse the
# previously computed matrix instead of recomputing it every time.
# ---------------------------------------------------------------------------
_corr_cache: Dict[tuple, pd.DataFrame] = {}

CfMethod = str  # "pearson" | "spearman" | "kendall"


def train_test_split_user(user_id: int, test_size: float = 0.2, seed: int = 42):
    """Split one user's full rating history into train/test Series (title -> rating)."""
    my_ratings = store.pivot_full.loc[user_id].dropna()
    train = my_ratings.sample(frac=1 - test_size, random_state=seed)
    test = my_ratings.drop(train.index)
    return train, test


def build_train_only_ratings(train_test: Dict[int, tuple]) -> pd.DataFrame:
    """Full ratings table with the evaluation users' held-out test ratings removed."""
    exclude = pd.Series(False, index=store.ratings.index)
    for uid, (_train, test) in train_test.items():
        exclude |= (store.ratings["user_id"] == uid) & (store.ratings["title"].isin(test.index))
    return store.ratings[~exclude]


def build_corr_matrix(
    cf_method: CfMethod,
    train_test: Dict[int, tuple],
    min_cf_ratings: int = 100,
) -> pd.DataFrame:
    """Movie-movie correlation matrix over movies with >= min_cf_ratings ratings,
    with evaluation test ratings strictly masked out.

    Data leakage prevention: before computing any correlation, each evaluation
    user's held-out test movie ratings are set to NaN in the pivot copy. This
    ensures the correlation matrix is built purely on training data, so test
    ratings can never leak into the similarity signal.

    Results are cached by (cf_method, min_cf_ratings, frozen user+test-titles
    key) so repeated calls with the same parameters skip expensive recomputation.
    """
    # Build a hashable cache key.
    cache_key = (
        cf_method,
        min_cf_ratings,
        frozenset(
            (uid, frozenset(test.index))
            for uid, (_train, test) in train_test.items()
        ),
    )
    if cache_key in _corr_cache:
        return _corr_cache[cache_key]

    # Dynamically filter the eligible column set by the requested threshold.
    # If the request threshold matches the precomputed pivot_eligible, reuse it
    # (fast path); otherwise slice pivot_full to the requested threshold.
    from .data_store import MIN_CF_RATINGS as DEFAULT_THRESHOLD
    if min_cf_ratings == DEFAULT_THRESHOLD:
        base_pivot = store.pivot_eligible
    else:
        eligible = store.movie_stats_full[
            store.movie_stats_full["num_ratings"] >= min_cf_ratings
        ].index
        cols = [t for t in eligible if t in store.pivot_full.columns]
        base_pivot = store.pivot_full[cols]

    pivot = base_pivot.copy()
    for uid, (_train, test) in train_test.items():
        cols = [c for c in test.index if c in pivot.columns]
        if cols:
            pivot.loc[uid, cols] = np.nan
    result = pivot.corr(method=cf_method, min_periods=MIN_PERIODS)
    _corr_cache[cache_key] = result
    return result


def _minmax(df: pd.DataFrame, col: str) -> pd.Series:
    rng = df[col].max() - df[col].min()
    if rng == 0 or pd.isna(rng):
        return pd.Series(0.0, index=df.index)
    return (df[col] - df[col].min()) / rng


def _center_ratings(train_ratings: pd.Series) -> pd.Series:
    """Center a user's training ratings around the scale midpoint (3 on the
    1-5 scale), not the user's own average.

    Without this, a movie the user rated 1/5 still contributes *positive*
    weighted similarity/genre-profile signal toward everything correlated
    with it -- just a smaller positive push than a 5/5 would. That's
    backwards: a genuinely disliked movie should push recommendations AWAY
    from its neighbors, not weakly toward them.

    The midpoint is fixed at 3 rather than each user's own mean on purpose:
    MovieLens ratings are skewed positive (avg per-user rating ~3.7, and
    ~85% of all ratings are 3+), so centering on the user's own average would
    treat an ordinary "I liked it" 3-star rating as a below-average dislike
    signal for most users -- discarding the bulk of the real positive signal
    to correct for a minority of true 1-2 star dislikes. Centering on the
    fixed scale midpoint keeps 4s/5s clearly positive and 3s mildly positive,
    while only 1s/2s (actual dislikes) go negative and suppress their
    neighbors -- matching what "disliked" means on this rating scale.

    Falls back to the raw ratings if the user rated everything identically
    (zero variance after centering), since centering would zero out every
    weight and leave nothing to score with.
    """
    centered = train_ratings - 3.0
    if not (centered != 0).any():
        # User rated every movie identically (e.g. all 3-stars).
        # Returning raw train_ratings would give every movie a large positive
        # weight (+3.0), falsely treating neutral ratings as strong endorsements.
        # Instead return a small uniform neutral weight (0.5) so the CF and
        # content signals stay meaningful without being dominated by rating noise.
        return pd.Series(0.5, index=train_ratings.index)
    return centered


def collaborative_scores(
    train_ratings: pd.Series, corr_matrix: pd.DataFrame, movie_stats: pd.DataFrame
) -> pd.DataFrame:
    """Full scored candidate table (not sliced to top-k) for the CF model."""
    centered = _center_ratings(train_ratings)
    train_pop = centered[centered.index.isin(corr_matrix.columns)]
    if train_pop.empty:
        return pd.DataFrame(columns=["similarity", "final_score"])

    sim_candidates = pd.Series(dtype="float64")
    for title, weight in train_pop.items():
        sims = corr_matrix[title].dropna()
        # Drop self-correlation: corr_matrix[title][title] == 1.0 (perfect).
        # Without this, the movie itself leaks into the candidate pool with a
        # weight proportional to the user's rating, biasing the aggregated score.
        sims = sims.drop(index=title, errors="ignore")
        sims = sims * weight
        sim_candidates = pd.concat([sim_candidates, sims])

    if sim_candidates.empty:
        return pd.DataFrame(columns=["similarity", "final_score"])

    sim_candidates = sim_candidates.groupby(sim_candidates.index).sum()
    sim_candidates = sim_candidates.drop(train_ratings.index, errors="ignore")
    if sim_candidates.empty:
        return pd.DataFrame(columns=["similarity", "final_score"])

    df = sim_candidates.to_frame("similarity").join(movie_stats, how="inner").dropna()
    if df.empty:
        return pd.DataFrame(columns=["similarity", "final_score"])

    df["similarity_norm"] = _minmax(df, "similarity")
    df["rating_norm"] = _minmax(df, "mean_rating")
    df["popularity_norm"] = _minmax(df, "num_ratings")
    df["final_score"] = 0.60 * df["similarity_norm"] + 0.20 * df["rating_norm"] + 0.20 * df["popularity_norm"]
    return df.sort_values("final_score", ascending=False)


def content_scores(train_ratings: pd.Series, candidate_titles: List[str]) -> pd.Series:
    """Cosine similarity between the user's genre-profile and every candidate title."""
    centered = _center_ratings(train_ratings)
    rows, weights = [], []
    for title, weight in centered.items():
        idx = store.title_to_tfidf_row.get(title)
        if idx is None:
            continue
        rows.append(idx)
        weights.append(weight)

    if not rows:
        return pd.Series(dtype="float64")

    weights_arr = np.array(weights)
    profile = np.asarray(store.tfidf_matrix[rows].multiply(weights_arr[:, None]).sum(axis=0)).ravel()
    norm = np.linalg.norm(profile)
    if norm == 0:
        return pd.Series(dtype="float64")
    profile = profile / norm

    candidate_idx = [store.title_to_tfidf_row[t] for t in candidate_titles if t in store.title_to_tfidf_row]
    valid_titles = [t for t in candidate_titles if t in store.title_to_tfidf_row]
    cand_matrix = store.tfidf_matrix[candidate_idx]
    sims = np.asarray(cand_matrix.dot(profile)).ravel()
    return pd.Series(sims, index=valid_titles, name="content_score")


def collaborative_recommend(
    train_ratings: pd.Series, corr_matrix: pd.DataFrame, movie_stats: pd.DataFrame, k: int = 10
) -> pd.DataFrame:
    return collaborative_scores(train_ratings, corr_matrix, movie_stats).head(k)


def content_recommend(
    train_ratings: pd.Series,
    k: int = 10,
    eligible_titles: Optional[List[str]] = None,
) -> pd.DataFrame:
    """Top-k content-based recommendations.

    Args:
        eligible_titles: Restrict candidates to this list (e.g. movies with
            >= min_cf_ratings ratings). Defaults to the full catalog when None.
    """
    candidates = eligible_titles if eligible_titles is not None else store.tfidf_title_order
    s = content_scores(train_ratings, candidates)
    s = s.drop(train_ratings.index, errors="ignore")
    s = s.sort_values(ascending=False)
    return s.head(k).to_frame("content_score")


def hybrid_recommend(
    train_ratings: pd.Series,
    corr_matrix: pd.DataFrame,
    movie_stats: pd.DataFrame,
    k: int = 10,
    alpha: float = 0.5,
    eligible_titles: Optional[List[str]] = None,
) -> pd.DataFrame:
    """Top-k hybrid recommendations blending CF (alpha) and Content (1-alpha).

    Args:
        eligible_titles: Candidate pool for the content half of the hybrid
            model. Must match the pool used for CF so both models compete on
            the same movies. Defaults to the full catalog when None.
    """
    cf_df = collaborative_scores(train_ratings, corr_matrix, movie_stats)
    candidates = eligible_titles if eligible_titles is not None else store.tfidf_title_order
    content_s = content_scores(train_ratings, candidates)
    content_s = content_s.drop(train_ratings.index, errors="ignore")

    if cf_df.empty and content_s.empty:
        return pd.DataFrame(columns=["hybrid_score"])

    df = pd.DataFrame(index=sorted(set(cf_df.index) | set(content_s.index)))
    df["cf_score"] = cf_df["final_score"] if not cf_df.empty else 0.0
    df["cf_score"] = df["cf_score"].fillna(0.0)
    df["content_score"] = content_s
    df["content_score"] = df["content_score"].fillna(0.0)

    df["cf_norm"] = _minmax(df, "cf_score")
    df["content_norm"] = _minmax(df, "content_score")
    df["hybrid_score"] = alpha * df["cf_norm"] + (1 - alpha) * df["content_norm"]
    return df.sort_values("hybrid_score", ascending=False).head(k)
