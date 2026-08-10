from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import RoleEnum


# ---------- Auth / User ----------

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    role: RoleEnum
    created_at: datetime


class UserAdminOut(BaseModel):
    """Extended user info for the admin panel — includes rating stats."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    role: RoleEnum
    created_at: datetime
    rating_count: int = 0          # number of movies rated (contribution)
    average_rating: Optional[float] = None  # avg score they give


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- TMDB search (admin picking a movie to add) ----------

class TMDBMovieResult(BaseModel):
    tmdb_id: int
    title: str
    overview: Optional[str] = None
    release_date: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    tmdb_rating: Optional[float] = None
    poster_url: Optional[str] = None


class Genre(BaseModel):
    id: int
    name: str


# ---------- Movie (showcase) ----------

class MovieBase(BaseModel):
    tmdb_id: int
    title: str
    overview: Optional[str] = None
    release_date: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    tmdb_rating: Optional[float] = None
    runtime: Optional[int] = None
    genres: Optional[str] = None


class MovieCreate(MovieBase):
    admin_rating: float = Field(ge=0, le=10)
    admin_review: Optional[str] = None
    is_featured: bool = False


class MovieUpdate(BaseModel):
    admin_rating: Optional[float] = Field(default=None, ge=0, le=10)
    admin_review: Optional[str] = None
    is_featured: Optional[bool] = None


class MovieOut(MovieBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    admin_rating: float
    admin_review: Optional[str] = None
    is_featured: bool
    created_at: datetime
    poster_url: Optional[str] = None
    average_user_rating: Optional[float] = None
    user_rating_count: int = 0
    is_audience_unlocked: bool = False


class MovieDetailOut(MovieOut):
    my_rating: Optional["UserRatingOut"] = None


# ---------- User ratings ----------

class UserRatingCreate(BaseModel):
    rating: float = Field(ge=0, le=10)
    review: Optional[str] = None


class UserRatingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    movie_id: int
    user_id: int
    rating: float
    review: Optional[str] = None
    username: Optional[str] = None
    created_at: datetime


MovieDetailOut.model_rebuild()
