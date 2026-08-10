from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException

from app.config import settings


def _client() -> httpx.Client:
    return httpx.Client(
        base_url=settings.TMDB_BASE_URL,
        params={"api_key": settings.TMDB_API_KEY},
        timeout=10.0,
    )


def poster_url(path: Optional[str]) -> Optional[str]:
    if not path:
        return None
    return f"{settings.TMDB_IMAGE_BASE_URL}{path}"


def _check_key():
    if not settings.TMDB_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="TMDB_API_KEY is not configured on the server. Set it in backend/.env",
        )


def get_genres() -> List[Dict[str, Any]]:
    _check_key()
    with _client() as client:
        resp = client.get("/genre/movie/list")
        resp.raise_for_status()
        return resp.json().get("genres", [])


def search_movies(query: str, page: int = 1) -> Dict[str, Any]:
    _check_key()
    with _client() as client:
        resp = client.get("/search/movie", params={"query": query, "page": page})
        resp.raise_for_status()
        return resp.json()


def discover_by_genre(genre_id: int, page: int = 1) -> Dict[str, Any]:
    _check_key()
    with _client() as client:
        resp = client.get(
            "/discover/movie",
            params={"with_genres": genre_id, "page": page, "sort_by": "popularity.desc"},
        )
        resp.raise_for_status()
        return resp.json()


def get_movie_details(tmdb_id: int) -> Dict[str, Any]:
    _check_key()
    with _client() as client:
        resp = client.get(f"/movie/{tmdb_id}")
        resp.raise_for_status()
        return resp.json()


def get_popular(page: int = 1) -> Dict[str, Any]:
    _check_key()
    with _client() as client:
        resp = client.get("/movie/popular", params={"page": page})
        resp.raise_for_status()
        return resp.json()
