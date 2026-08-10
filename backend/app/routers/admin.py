from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Movie, User
from app.schemas import MovieCreate, MovieOut, MovieUpdate, TMDBMovieResult
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
