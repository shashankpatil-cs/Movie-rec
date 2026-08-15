import difflib
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Movie, User, UserRating
from app.schemas import Genre, MovieDetailOut, MovieOut, UserRatingOut
from app.tmdb import get_genres, poster_url

router = APIRouter(prefix="/api/movies", tags=["movies"])


def _to_movie_out(db: Session, movie: Movie) -> MovieOut:
    agg = (
        db.query(func.avg(UserRating.rating), func.count(UserRating.id))
        .filter(UserRating.movie_id == movie.id)
        .first()
    )
    avg_rating, count = agg if agg else (None, 0)
    count = count or 0
    is_unlocked = count >= 3
    data = MovieOut.model_validate(movie)
    data.poster_url = poster_url(movie.poster_path)
    data.user_rating_count = count
    data.is_audience_unlocked = is_unlocked
    data.average_user_rating = round(avg_rating, 2) if (avg_rating is not None and is_unlocked) else None
    return data


@router.get("/genres", response_model=List[Genre])
def list_genres():
    """Genre list pulled live from TMDB, used to populate the search-by-genre dropdown."""
    genres = get_genres()
    return genres


@router.get("", response_model=List[MovieOut])
def list_movies(
    q: Optional[str] = Query(default=None, description="Search by movie title"),
    genre: Optional[str] = Query(default=None, description="Filter by genre name, e.g. 'Action'"),
    featured_only: bool = Query(default=False),
    sort: str = Query(
        default="newest",
        pattern="^(newest|admin_rating|title|user_rating|runtime_desc|runtime_asc)$",
    ),
    db: Session = Depends(get_db),
):
    query = db.query(Movie)

    if genre:
        query = query.filter(Movie.genres.ilike(f"%{genre}%"))

    if featured_only:
        query = query.filter(Movie.is_featured.is_(True))

    all_movies = query.all()

    exact_matches = None  # initialise so sort guards below always have it in scope

    if q:
        q_clean = q.strip().lower()
        exact_matches = [m for m in all_movies if q_clean in m.title.lower()]
        if exact_matches:
            movies = exact_matches
        else:
            scored_movies = []
            for m in all_movies:
                t_lower = m.title.lower()
                ratio = difflib.SequenceMatcher(None, q_clean, t_lower).ratio()
                words = t_lower.split()
                max_word_ratio = max(
                    [difflib.SequenceMatcher(None, q_clean, w).ratio() for w in words],
                    default=0,
                )
                score = max(ratio, max_word_ratio)
                if score >= 0.45:
                    scored_movies.append((score, m))
            scored_movies.sort(key=lambda x: x[0], reverse=True)
            movies = [m for _, m in scored_movies]
    else:
        movies = all_movies

    if sort == "newest" and not (q and not exact_matches):
        movies.sort(key=lambda m: m.created_at, reverse=True)
    elif sort == "admin_rating" and not (q and not exact_matches):
        movies.sort(key=lambda m: m.admin_rating or 0, reverse=True)
    elif sort == "title" and not (q and not exact_matches):
        movies.sort(key=lambda m: m.title)
    elif sort == "runtime_desc" and not (q and not exact_matches):
        movies.sort(key=lambda m: m.runtime or 0, reverse=True)
    elif sort == "runtime_asc" and not (q and not exact_matches):
        movies.sort(key=lambda m: (m.runtime is None or m.runtime == 0, m.runtime or 0))

    results = [_to_movie_out(db, m) for m in movies]

    if sort == "user_rating" and not (q and not exact_matches):
        results.sort(key=lambda m: (m.average_user_rating or 0), reverse=True)

    return results


@router.get("/my-rated-ids", response_model=List[int])
def get_my_rated_movie_ids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return IDs of showcase movies the current user has already rated."""
    rows = db.query(UserRating.movie_id).filter(UserRating.user_id == current_user.id).all()
    return [r.movie_id for r in rows]


@router.get("/my-ratings")
def get_my_ratings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a mapping of {movie_id: rating} for movies the current user has rated."""
    rows = db.query(UserRating.movie_id, UserRating.rating).filter(UserRating.user_id == current_user.id).all()
    return {r.movie_id: r.rating for r in rows}


@router.get("/my-watched")
def get_my_watched_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all showcase movies rated by the current user with rating and review details."""
    ratings = (
        db.query(UserRating, Movie)
        .join(Movie, Movie.id == UserRating.movie_id)
        .filter(UserRating.user_id == current_user.id)
        .order_by(UserRating.updated_at.desc(), UserRating.created_at.desc())
        .all()
    )
    results = []
    for r, m in ratings:
        results.append({
            "id": m.id,
            "tmdb_id": m.tmdb_id,
            "title": m.title,
            "overview": m.overview,
            "release_date": m.release_date,
            "poster_url": poster_url(m.poster_path),
            "backdrop_path": m.backdrop_path,
            "runtime": m.runtime,
            "genres": m.genres,
            "admin_rating": m.admin_rating,
            "my_rating": r.rating,
            "my_review": r.review,
            "rated_at": r.updated_at or r.created_at,
        })
    return results


@router.get("/{movie_id}", response_model=MovieDetailOut)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    base = _to_movie_out(db, movie)
    return MovieDetailOut(**base.model_dump(), my_rating=None)


@router.get("/{movie_id}/ratings", response_model=List[UserRatingOut])
def list_movie_ratings(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    ratings = db.query(UserRating).filter(UserRating.movie_id == movie_id).all()
    out = []
    for r in ratings:
        item = UserRatingOut.model_validate(r)
        item.username = r.user.username if r.user else None
        out.append(item)
    return out
