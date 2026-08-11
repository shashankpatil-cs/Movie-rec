from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Movie, RoleEnum, User, UserRating
from app.schemas import MovieCreate, MovieOut, MovieUpdate, TMDBMovieResult, UserAdminOut
from app.tmdb import discover_by_genre, get_movie_details, poster_url, search_movies

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/tmdb/search", response_model=List[TMDBMovieResult])
def tmdb_search(
    q: Optional[str] = Query(default=None),
    genre_id: Optional[int] = Query(default=None),
    page: int = 1,
    _admin: User = Depends(require_admin),
):
    """Admin-only: search TMDB catalog to find a movie to add to the showcase."""
    if q:
        data = search_movies(q, page=page)
    elif genre_id:
        data = discover_by_genre(genre_id, page=page)
    else:
        raise HTTPException(status_code=400, detail="Provide either q or genre_id")

    results = []
    for m in data.get("results", []):
        results.append(
            TMDBMovieResult(
                tmdb_id=m["id"],
                title=m.get("title", "Untitled"),
                overview=m.get("overview"),
                release_date=m.get("release_date"),
                poster_path=m.get("poster_path"),
                backdrop_path=m.get("backdrop_path"),
                tmdb_rating=m.get("vote_average"),
                poster_url=poster_url(m.get("poster_path")),
            )
        )
    return results


@router.get("/tmdb/movie/{tmdb_id}", response_model=TMDBMovieResult)
def tmdb_movie_detail(tmdb_id: int, _admin: User = Depends(require_admin)):
    """Fetch full details (incl. genres, runtime) for a specific TMDB movie."""
    m = get_movie_details(tmdb_id)
    return TMDBMovieResult(
        tmdb_id=m["id"],
        title=m.get("title", "Untitled"),
        overview=m.get("overview"),
        release_date=m.get("release_date"),
        poster_path=m.get("poster_path"),
        backdrop_path=m.get("backdrop_path"),
        tmdb_rating=m.get("vote_average"),
        poster_url=poster_url(m.get("poster_path")),
    )


@router.post("/movies", response_model=MovieOut, status_code=201)
def add_movie(payload: MovieCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    existing = db.query(Movie).filter(Movie.tmdb_id == payload.tmdb_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="This movie is already in the showcase")

    # Enrich with runtime/genres straight from TMDB so the admin doesn't need to type them.
    genres_str = payload.genres
    runtime = payload.runtime
    try:
        details = get_movie_details(payload.tmdb_id)
        genres_str = genres_str or ", ".join(g["name"] for g in details.get("genres", []))
        runtime = runtime or details.get("runtime")
    except Exception:
        pass  # fall back to whatever the client sent; don't block adding the movie

    movie = Movie(
        tmdb_id=payload.tmdb_id,
        title=payload.title,
        overview=payload.overview,
        release_date=payload.release_date,
        poster_path=payload.poster_path,
        backdrop_path=payload.backdrop_path,
        tmdb_rating=payload.tmdb_rating,
        runtime=runtime,
        genres=genres_str,
        admin_rating=payload.admin_rating,
        admin_review=payload.admin_review,
        is_featured=payload.is_featured,
    )
    db.add(movie)
    db.commit()
    db.refresh(movie)

    out = MovieOut.model_validate(movie)
    out.poster_url = poster_url(movie.poster_path)
    out.average_user_rating = None
    out.user_rating_count = 0
    return out


@router.put("/movies/{movie_id}", response_model=MovieOut)
def update_movie(
    movie_id: int,
    payload: MovieUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    if payload.admin_rating is not None:
        movie.admin_rating = payload.admin_rating
    if payload.admin_review is not None:
        movie.admin_review = payload.admin_review
    if payload.is_featured is not None:
        movie.is_featured = payload.is_featured

    db.commit()
    db.refresh(movie)

    out = MovieOut.model_validate(movie)
    out.poster_url = poster_url(movie.poster_path)
    return out


@router.delete("/movies/{movie_id}", status_code=204)
def delete_movie(movie_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    db.delete(movie)
    db.commit()
    return None


# ------------------------------------------------------------------ #
#  User management                                                     #
# ------------------------------------------------------------------ #

@router.get("/users", response_model=List[UserAdminOut])
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Admin-only: list every registered user with their rating contribution stats."""
    # Aggregate rating stats in one query to avoid N+1
    stats = (
        db.query(
            UserRating.user_id,
            func.count(UserRating.id).label("rating_count"),
            func.avg(UserRating.rating).label("average_rating"),
        )
        .group_by(UserRating.user_id)
        .all()
    )
    stats_map = {row.user_id: row for row in stats}

    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        row = stats_map.get(u.id)
        result.append(
            UserAdminOut(
                id=u.id,
                username=u.username,
                email=u.email,
                role=u.role,
                created_at=u.created_at,
                rating_count=row.rating_count if row else 0,
                average_rating=round(float(row.average_rating), 2) if row else None,
            )
        )
    return result


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin-only: permanently delete a user account and all their ratings."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == RoleEnum.admin:
        raise HTTPException(status_code=400, detail="Cannot delete another admin account")

    db.delete(user)  # cascade="all, delete-orphan" on ratings handles cleanup
    db.commit()
    return None


class AdminRatingOut(BaseModel):
    """Flat projection used by the admin ratings view."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    username: str
    movie_id: int
    movie_title: str
    poster_url: Optional[str] = None
    rating: float
    review: Optional[str] = None
    created_at: datetime




@router.get("/ratings", response_model=List[AdminRatingOut])
def list_all_ratings(
    movie_id: Optional[int] = Query(default=None),
    user_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin-only: list every user rating, optionally filtered by movie or user."""
    q = db.query(UserRating).join(User, UserRating.user_id == User.id).join(
        Movie, UserRating.movie_id == Movie.id
    )
    if movie_id:
        q = q.filter(UserRating.movie_id == movie_id)
    if user_id:
        q = q.filter(UserRating.user_id == user_id)

    ratings = q.order_by(UserRating.created_at.desc()).all()

    result = []
    for r in ratings:
        result.append(
            AdminRatingOut(
                id=r.id,
                user_id=r.user_id,
                username=r.user.username,
                movie_id=r.movie_id,
                movie_title=r.movie.title,
                poster_url=poster_url(r.movie.poster_path),
                rating=r.rating,
                review=r.review,
                created_at=r.created_at,
            )
        )
    return result


@router.delete("/ratings/{rating_id}", status_code=204)
def delete_rating(
    rating_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin-only: delete any user's rating."""
    rating = db.query(UserRating).filter(UserRating.id == rating_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found")

    db.delete(rating)
    db.commit()
    return None

