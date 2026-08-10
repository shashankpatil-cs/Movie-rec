from typing import List, Dict, Any
import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Movie, User, UserRating
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("")
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Personalized recommendation endpoint enforcing the 3-tier rule:
    1. User < 3 ratings: Locked (Prompt to rate 3+ movies)
    2. User >= 3 ratings but low overall community data (<3 other users or <10 total ratings): Content-Based
    3. User >= 3 ratings + sufficient community data: Hybrid (Content-Based + Collaborative Filtering)
    """
    # 1. Fetch current user's submitted ratings
    my_ratings = db.query(UserRating).filter(UserRating.user_id == current_user.id).all()
    user_rating_count = len(my_ratings)

    if user_rating_count < 3:
        return {
            "status": "locked",
            "recommendation_type": "none",
            "user_rating_count": user_rating_count,
            "required_ratings": 3,
            "message": "Please rate at least 3 movies to unlock personalized recommendations!",
            "badge": "🔒 3+ Ratings Required",
            "movies": [],
        }

    # Gather user's rated movie IDs
    rated_movie_ids = {r.movie_id for r in my_ratings}
    my_rating_map = {r.movie_id: r.rating for r in my_ratings}

    # Fetch all movies from DB
    all_movies = db.query(Movie).all()
    movies_dict = {m.id: m for m in all_movies}

    # Unrated candidate movies
    candidate_movies = [m for m in all_movies if m.id not in rated_movie_ids]

    # Check overall community data in DB (excluding current user)
    other_users_count = (
        db.query(UserRating.user_id)
        .filter(UserRating.user_id != current_user.id)
        .distinct()
        .count()
    )
    total_db_ratings = db.query(UserRating).count()

    is_sufficient_community_data = (other_users_count >= 3) and (total_db_ratings >= 10)

    # Helper: Content-Based Scoring based on genre affinity
    genre_weights: Dict[str, float] = {}
    for r in my_ratings:
        m = movies_dict.get(r.movie_id)
        if not m or not m.genres:
            continue
        g_list = [g.strip() for g in m.genres.split(",") if g.strip()]
        # Weight genres by user's rating score relative to average (e.g. rating >= 6 boosts genre)
        weight = r.rating - 5.0
        for g in g_list:
            genre_weights[g] = genre_weights.get(g, 0.0) + weight

    def get_content_score(movie: Movie) -> float:
        if not movie.genres:
            return 0.0
        m_genres = [g.strip() for g in movie.genres.split(",") if g.strip()]
        score = sum(genre_weights.get(g, 0.0) for g in m_genres)
        # Add slight admin score boost
        admin_boost = (movie.admin_rating or 5.0) * 0.1
        return score + admin_boost

    # Determine Algorithm
    if not is_sufficient_community_data:
        # Tier 2: Content-Based Recommendations
        scored_candidates = []
        for m in candidate_movies:
            c_score = get_content_score(m)
            scored_candidates.append((c_score, m))

        scored_candidates.sort(key=lambda x: x[0], reverse=True)
        recommended_movies = [m for _, m in scored_candidates[:12]]

        return {
            "status": "unlocked",
            "recommendation_type": "content_based",
            "badge": "✨ Content-Based Recommendations",
            "message": "Based on your favorite genres & rating history",
            "user_rating_count": user_rating_count,
            "movies": [_format_movie(m, db) for m in recommended_movies],
        }

    else:
        # Tier 3: Hybrid Recommendations (Content-Based + Collaborative Filtering)
        # Fetch all ratings in DB
        all_ratings = db.query(UserRating).all()

        # Build user-item rating matrix: {user_id: {movie_id: rating}}
        user_item_matrix: Dict[int, Dict[int, float]] = {}
        for r in all_ratings:
            if r.user_id not in user_item_matrix:
                user_item_matrix[r.user_id] = {}
            user_item_matrix[r.user_id][r.movie_id] = r.rating

        # Compute Pearson / Cosine similarity between current_user and other users
        user_similarities: Dict[int, float] = {}
        my_ratings_dict = user_item_matrix.get(current_user.id, {})

        for other_uid, other_ratings_dict in user_item_matrix.items():
            if other_uid == current_user.id:
                continue
            # Overlapping movies
            common_movies = set(my_ratings_dict.keys()) & set(other_ratings_dict.keys())
            if not common_movies:
                continue

            # Cosine similarity
            dot_product = sum(my_ratings_dict[mid] * other_ratings_dict[mid] for mid in common_movies)
            norm_a = math.sqrt(sum(my_ratings_dict[mid] ** 2 for mid in common_movies))
            norm_b = math.sqrt(sum(other_ratings_dict[mid] ** 2 for mid in common_movies))
            similarity = dot_product / (norm_a * norm_b) if norm_a and norm_b else 0.0
            if similarity > 0:
                user_similarities[other_uid] = similarity

        # Calculate predicted collaborative score for candidates
        collab_scores: Dict[int, float] = {}
        for m in candidate_movies:
            weighted_sum = 0.0
            sim_sum = 0.0
            for other_uid, sim in user_similarities.items():
                if m.id in user_item_matrix[other_uid]:
                    weighted_sum += sim * user_item_matrix[other_uid][m.id]
                    sim_sum += sim
            if sim_sum > 0:
                collab_scores[m.id] = weighted_sum / sim_sum
            else:
                collab_scores[m.id] = 5.0  # neutral fallback

        # Normalize content scores & collab scores to [0, 10] range
        content_scores_raw = {m.id: get_content_score(m) for m in candidate_movies}
        max_c = max(content_scores_raw.values()) if content_scores_raw and max(content_scores_raw.values()) > 0 else 1.0

        hybrid_scored = []
        for m in candidate_movies:
            c_norm = (content_scores_raw[m.id] / max_c) * 10.0
            cf_norm = collab_scores.get(m.id, 5.0)
            hybrid_score = 0.5 * c_norm + 0.5 * cf_norm
            hybrid_scored.append((hybrid_score, m))

        hybrid_scored.sort(key=lambda x: x[0], reverse=True)
        recommended_movies = [m for _, m in hybrid_scored[:12]]

        return {
            "status": "unlocked",
            "recommendation_type": "hybrid",
            "badge": "🚀 Hybrid Recommendations (Content + Collaborative)",
            "message": "Powered by genre preferences & community viewing similarity",
            "user_rating_count": user_rating_count,
            "movies": [_format_movie(m, db) for m in recommended_movies],
        }


def _format_movie(m: Movie, db: Session) -> dict:
    """Format movie instance to dict matching MovieOut schema."""
    user_ratings = db.query(UserRating.rating).filter(UserRating.movie_id == m.id).all()
    user_rating_count = len(user_ratings)
    avg_rating = (sum(r[0] for r in user_ratings) / user_rating_count) if user_rating_count > 0 else None
    is_unlocked = user_rating_count >= 3 and avg_rating is not None

    return {
        "id": m.id,
        "tmdb_id": m.tmdb_id,
        "title": m.title,
        "overview": m.overview,
        "release_date": m.release_date,
        "poster_path": m.poster_path,
        "backdrop_path": m.backdrop_path,
        "admin_rating": m.admin_rating,
        "admin_review": m.admin_review,
        "is_featured": m.is_featured,
        "created_at": m.created_at.isoformat() if m.created_at else None,
        "poster_url": m.poster_url,
        "genres": m.genres,
        "runtime": m.runtime,
        "average_user_rating": round(avg_rating, 1) if avg_rating is not None else None,
        "user_rating_count": user_rating_count,
        "is_audience_unlocked": is_unlocked,
    }
