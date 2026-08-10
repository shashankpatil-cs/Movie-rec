"""
Public TMDB exploration endpoints — no authentication required.
Users can search the full TMDB catalog and view movie details
for any title (including those not in the admin showcase).
"""
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.tmdb import discover_by_genre, get_movie_details, poster_url, search_movies

router = APIRouter(prefix="/api/explore", tags=["explore"])


def _fmt(m: dict) -> dict:
    """Shared helper: shape a raw TMDB result dict into our response format."""
    return {
        "tmdb_id": m["id"],
        "title": m.get("title", "Untitled"),
        "overview": m.get("overview"),
        "release_date": m.get("release_date"),
        "poster_path": m.get("poster_path"),
        "backdrop_path": m.get("backdrop_path"),
        "tmdb_rating": m.get("vote_average"),
        "vote_count": m.get("vote_count", 0),
        "poster_url": poster_url(m.get("poster_path")),
        "genres": None,
        "runtime": None,
    }


@router.get("/suggest")
def explore_suggest(
    q: str = Query(..., min_length=1, description="Partial or full movie title"),
):
    """
    Return top-5 suggestions sorted by TMDB vote_count (most-rated first).
    Handles minor typos because TMDB's own fuzzy matcher covers them.
    Used for the live autocomplete dropdown.
    """
    data = search_movies(q, page=1)
    results = data.get("results", [])

    # Sort by vote_count descending — most well-known film surfaces first.
    results.sort(key=lambda m: m.get("vote_count", 0), reverse=True)

    return [_fmt(m) for m in results[:5]]


@router.get("/search")
def explore_search(
    q: Optional[str] = Query(default=None, description="Free-text movie title"),
    genre_id: Optional[int] = Query(default=None, description="TMDB genre ID"),
    page: int = Query(default=1, ge=1, le=500),
):
    """Search the full TMDB catalog. Open to all visitors — no login needed."""
    if not q and not genre_id:
        raise HTTPException(status_code=400, detail="Provide either 'q' or 'genre_id'")

    if q:
        data = search_movies(q, page=page)
    else:
        data = discover_by_genre(genre_id, page=page)

    results = [_fmt(m) for m in data.get("results", [])]
    return {
        "results": results,
        "total_results": data.get("total_results", 0),
        "total_pages": data.get("total_pages", 1),
    }


@router.get("/movie/{tmdb_id}")
def explore_movie_detail(tmdb_id: int):
    """Fetch full TMDB details for any movie. Open to all visitors — no login needed."""
    try:
        m = get_movie_details(tmdb_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Movie not found on TMDB")

    genres_str = ", ".join(g["name"] for g in m.get("genres", []))

    return {
        "tmdb_id": m["id"],
        "title": m.get("title", "Untitled"),
        "overview": m.get("overview"),
        "release_date": m.get("release_date"),
        "poster_path": m.get("poster_path"),
        "backdrop_path": m.get("backdrop_path"),
        "tmdb_rating": m.get("vote_average"),
        "poster_url": poster_url(m.get("poster_path")),
        "genres": genres_str,
        "runtime": m.get("runtime"),
        "tagline": m.get("tagline"),
        "vote_count": m.get("vote_count"),
        "original_language": m.get("original_language"),
        "production_countries": [c["name"] for c in m.get("production_countries", [])],
    }
