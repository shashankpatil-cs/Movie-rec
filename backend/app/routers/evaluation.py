"""
ML Evaluation Router — Admin-only endpoint.

Evaluates the quality of Content-Based, Collaborative Filtering, and Hybrid
recommendation models using leave-one-out cross-validation.

Metrics:
  - Precision@K: |recommended ∩ relevant| / K
  - Recall@K:    |recommended ∩ relevant| / |relevant|
  - MAE/RMSE:    For the Collaborative Filtering model, comparing its predicted
                 rating for the held-out item vs. the actual rating.

Methodology (Leave-One-Out):
  For each user with >= 3 ratings:
    1. Hold out their highest-rated unrated item (rating >= 7) as the "relevant" item.
    2. Use remaining ratings to score candidate movies with each model.
    3. Check if the held-out item appears in top-K results.
    4. Also record CF's predicted score for the held-out item for MAE/RMSE.
"""

import math
from typing import Dict, List, Any, Optional, Tuple

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Movie, User, UserRating

router = APIRouter(prefix="/api/admin", tags=["admin", "evaluation"])

_K_VALUES = [5, 10]


# ──────────────────────────────────────────────────────────────────────────────
# Internal evaluation helpers
# ──────────────────────────────────────────────────────────────────────────────

def _genre_weights_from_ratings(
    ratings: List[UserRating], movies_dict: Dict[int, Movie]
) -> Dict[str, float]:
    """Build genre affinity weights from a list of UserRating objects."""
    weights: Dict[str, float] = {}
    for r in ratings:
        m = movies_dict.get(r.movie_id)
        if not m or not m.genres:
            continue
        for g in [g.strip() for g in m.genres.split(",") if g.strip()]:
            weights[g] = weights.get(g, 0.0) + (r.rating - 5.0)
    return weights


def _content_score(movie: Movie, genre_weights: Dict[str, float]) -> float:
    """Content-based score for a movie given genre affinity weights."""
    if not movie.genres:
        return 0.0
    genres = [g.strip() for g in movie.genres.split(",") if g.strip()]
    score = sum(genre_weights.get(g, 0.0) for g in genres)
    admin_boost = (movie.admin_rating or 5.0) * 0.1
    return score + admin_boost


def _cosine_similarity(a: Dict[int, float], b: Dict[int, float]) -> float:
    """Cosine similarity between two rating dicts keyed by movie_id."""
    common = set(a) & set(b)
    if not common:
        return 0.0
    dot = sum(a[mid] * b[mid] for mid in common)
    norm_a = math.sqrt(sum(a[mid] ** 2 for mid in common))
    norm_b = math.sqrt(sum(b[mid] ** 2 for mid in common))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


def _predict_cf_score(
    target_movie_id: int,
    user_similarities: Dict[int, float],
    user_item_matrix: Dict[int, Dict[int, float]],
) -> Optional[float]:
    """
    Predict a collaborative-filtering rating for a movie using weighted average
    of similar users' ratings. Returns None if no similar user has rated the movie.
    """
    weighted_sum = 0.0
    sim_sum = 0.0
    for uid, sim in user_similarities.items():
        if target_movie_id in user_item_matrix.get(uid, {}):
            weighted_sum += sim * user_item_matrix[uid][target_movie_id]
            sim_sum += abs(sim)
    if sim_sum > 0:
        return weighted_sum / sim_sum
    return None


def _rank_movies_content(
    candidates: List[Movie], genre_weights: Dict[str, float]
) -> List[int]:
    """Return candidate movie IDs ranked by content-based score, descending."""
    scored = [(m.id, _content_score(m, genre_weights)) for m in candidates]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [mid for mid, _ in scored]


def _rank_movies_collaborative(
    candidates: List[Movie],
    user_similarities: Dict[int, float],
    user_item_matrix: Dict[int, Dict[int, float]],
) -> List[int]:
    """Return candidate movie IDs ranked by CF predicted score, descending."""
    scored = []
    for m in candidates:
        pred = _predict_cf_score(m.id, user_similarities, user_item_matrix)
        scored.append((m.id, pred if pred is not None else 5.0))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [mid for mid, _ in scored]


def _rank_movies_hybrid(
    candidates: List[Movie],
    genre_weights: Dict[str, float],
    user_similarities: Dict[int, float],
    user_item_matrix: Dict[int, Dict[int, float]],
) -> List[int]:
    """Return candidate movie IDs ranked by hybrid score (0.5 CB + 0.5 CF), descending."""
    content_raw = {m.id: _content_score(m, genre_weights) for m in candidates}
    max_c = max(content_raw.values()) if content_raw and max(content_raw.values()) > 0 else 1.0

    scored = []
    for m in candidates:
        c_norm = (content_raw[m.id] / max_c) * 10.0
        cf_pred = _predict_cf_score(m.id, user_similarities, user_item_matrix)
        cf_norm = cf_pred if cf_pred is not None else 5.0
        hybrid = 0.5 * c_norm + 0.5 * cf_norm
        scored.append((m.id, hybrid))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [mid for mid, _ in scored]


def _precision_at_k(ranked_ids: List[int], relevant_id: int, k: int) -> float:
    top_k = ranked_ids[:k]
    return 1.0 / k if relevant_id in top_k else 0.0


def _recall_at_k(ranked_ids: List[int], relevant_id: int, k: int) -> float:
    """With one relevant item, recall@k = 1.0 if in top-K else 0.0."""
    return 1.0 if relevant_id in ranked_ids[:k] else 0.0


# ──────────────────────────────────────────────────────────────────────────────
# Core evaluation function (importable for testing)
# ──────────────────────────────────────────────────────────────────────────────

def compute_ml_evaluation(db: Session) -> Dict[str, Any]:
    """
    Run leave-one-out cross-validation for Content-Based, CF, and Hybrid models.
    Returns a structured evaluation report.
    """
    all_movies = db.query(Movie).all()
    movies_dict: Dict[int, Movie] = {m.id: m for m in all_movies}

    all_ratings = db.query(UserRating).all()

    # Group ratings by user
    user_ratings_map: Dict[int, List[UserRating]] = {}
    for r in all_ratings:
        user_ratings_map.setdefault(r.user_id, []).append(r)

    # Build full user-item matrix for CF
    user_item_matrix: Dict[int, Dict[int, float]] = {}
    for uid, ratings in user_ratings_map.items():
        user_item_matrix[uid] = {r.movie_id: r.rating for r in ratings}

    # Filter eligible users (>= 3 ratings, at least one rated >= 7)
    eligible: List[Tuple[int, List[UserRating], UserRating]] = []
    for uid, ratings in user_ratings_map.items():
        if len(ratings) < 3:
            continue
        high_rated = [r for r in ratings if r.rating >= 7]
        if not high_rated:
            continue
        # Choose the highest-rated item as the held-out "relevant" item
        holdout = max(high_rated, key=lambda r: r.rating)
        eligible.append((uid, ratings, holdout))

    total_users = len(eligible)

    if total_users < 2:
        return {
            "status": "insufficient_data",
            "message": (
                f"Need at least 2 eligible users (each with ≥3 ratings and ≥1 rating ≥7) "
                f"for meaningful evaluation. Currently have {total_users}."
            ),
            "total_users_evaluated": total_users,
            "total_movies": len(all_movies),
            "total_ratings": len(all_ratings),
            "models": {},
        }

    # Accumulators per model per K
    results: Dict[str, Dict[str, list]] = {
        "content_based": {f"precision@{k}": [] for k in _K_VALUES} | {f"recall@{k}": [] for k in _K_VALUES},
        "collaborative": {f"precision@{k}": [] for k in _K_VALUES} | {f"recall@{k}": [] for k in _K_VALUES},
        "hybrid":        {f"precision@{k}": [] for k in _K_VALUES} | {f"recall@{k}": [] for k in _K_VALUES},
    }
    cf_errors: List[float] = []   # (predicted - actual) for MAE/RMSE

    for uid, ratings, holdout in eligible:
        holdout_mid = holdout.movie_id
        actual_rating = holdout.rating

        # Training ratings: everything except the held-out item
        train_ratings = [r for r in ratings if r.movie_id != holdout_mid]
        train_ids = {r.movie_id for r in train_ratings}

        # Candidate movies: NOT in training set (user hasn't "seen" them in training)
        # Include held-out movie so we can measure if it gets recommended
        candidates = [m for m in all_movies if m.id not in train_ids]

        if not candidates:
            continue

        # ── Content-Based ──────────────────────────────────────────────────
        gw = _genre_weights_from_ratings(train_ratings, movies_dict)
        cb_ranked = _rank_movies_content(candidates, gw)

        # ── Collaborative Filtering ───────────────────────────────────────
        # Temporarily use train_ratings for this user's CF matrix
        temp_matrix = dict(user_item_matrix)
        temp_matrix[uid] = {r.movie_id: r.rating for r in train_ratings}

        user_similarities: Dict[int, float] = {}
        my_dict = temp_matrix[uid]
        for other_uid, other_dict in temp_matrix.items():
            if other_uid == uid:
                continue
            sim = _cosine_similarity(my_dict, other_dict)
            if sim > 0:
                user_similarities[other_uid] = sim

        cf_ranked = _rank_movies_collaborative(candidates, user_similarities, temp_matrix)

        # MAE/RMSE: record CF's predicted rating for the held-out item
        cf_pred = _predict_cf_score(holdout_mid, user_similarities, temp_matrix)
        if cf_pred is not None:
            cf_errors.append(cf_pred - actual_rating)

        # ── Hybrid ────────────────────────────────────────────────────────
        hybrid_ranked = _rank_movies_hybrid(candidates, gw, user_similarities, temp_matrix)

        # Accumulate metrics per K
        for k in _K_VALUES:
            for model_key, ranked in [
                ("content_based", cb_ranked),
                ("collaborative", cf_ranked),
                ("hybrid", hybrid_ranked),
            ]:
                results[model_key][f"precision@{k}"].append(_precision_at_k(ranked, holdout_mid, k))
                results[model_key][f"recall@{k}"].append(_recall_at_k(ranked, holdout_mid, k))

    # Average metrics
    def avg(lst: list) -> Optional[float]:
        return round(sum(lst) / len(lst), 4) if lst else None

    mae = round(sum(abs(e) for e in cf_errors) / len(cf_errors), 4) if cf_errors else None
    rmse = round(math.sqrt(sum(e ** 2 for e in cf_errors) / len(cf_errors)), 4) if cf_errors else None

    models_out: Dict[str, Any] = {}
    for model_key in ["content_based", "collaborative", "hybrid"]:
        m_results = {
            metric: avg(values)
            for metric, values in results[model_key].items()
        }
        if model_key == "collaborative":
            m_results["mae"] = mae
            m_results["rmse"] = rmse
        models_out[model_key] = m_results

    return {
        "status": "ok",
        "message": f"Evaluated on {total_users} users using leave-one-out cross-validation.",
        "total_users_evaluated": total_users,
        "total_movies": len(all_movies),
        "total_ratings": len(all_ratings),
        "k_values": _K_VALUES,
        "models": models_out,
    }


# ──────────────────────────────────────────────────────────────────────────────
# API endpoint
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/ml-evaluation")
def get_ml_evaluation(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """
    Admin-only: compute and return ML evaluation metrics for all recommendation models.
    Uses leave-one-out cross-validation. May take a few seconds on larger datasets.
    """
    return compute_ml_evaluation(db)
