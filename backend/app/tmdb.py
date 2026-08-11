import difflib
import re
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException

from app.config import settings

_POPULAR_TITLES_CACHE: set = set()
_LAST_CACHE_UPDATE: float = 0.0


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


def _get_popular_titles_pool() -> List[str]:
    global _POPULAR_TITLES_CACHE, _LAST_CACHE_UPDATE
    now = time.time()
    if _POPULAR_TITLES_CACHE and (now - _LAST_CACHE_UPDATE < 3600):
        return list(_POPULAR_TITLES_CACHE)

    try:
        with _client() as client:
            titles = set()
            for endpoint in ["/movie/popular", "/movie/top_rated"]:
                for p in range(1, 3):
                    r = client.get(endpoint, params={"page": p}).json()
                    for m in r.get("results", []):
                        if m.get("title"):
                            titles.add(m["title"])
            if titles:
                _POPULAR_TITLES_CACHE = titles
                _LAST_CACHE_UPDATE = now
    except Exception:
        pass
    return list(_POPULAR_TITLES_CACHE)


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
        data = resp.json()

        # If direct search returned results, return it
        if data.get("results"):
            return data

        # If 0 results, attempt fuzzy candidate corrections
        candidates: List[str] = []
        pool = _get_popular_titles_pool()
        if pool:
            matches = difflib.get_close_matches(query, pool, n=3, cutoff=0.5)
            candidates.extend(matches)

        q_lower = query.lower().strip()
        variations = [
            q_lower.replace("eller", "ellar"),
            q_lower.replace("ton", "tion"),
            q_lower.replace("ter", "tor"),
            re.sub(r"(.)\1+", r"\1", q_lower),
        ]
        for v in variations:
            if v and v not in candidates and v != q_lower:
                candidates.append(v)

        for cand in candidates:
            try:
                c_resp = client.get("/search/movie", params={"query": cand, "page": page})
                if c_resp.status_code == 200:
                    c_data = c_resp.json()
                    if c_data.get("results"):
                        return c_data
            except Exception:
                pass

        return data


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

