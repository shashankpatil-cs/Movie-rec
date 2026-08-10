import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ratings = relationship("UserRating", back_populates="user", cascade="all, delete-orphan")

    @property
    def is_admin(self) -> bool:
        return self.role == RoleEnum.admin


class Movie(Base):
    """
    A movie curated/showcased by the admin. Sourced from TMDB but
    stored locally so the admin's personal rating/review persists
    even if TMDB data changes.
    """

    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True, nullable=False)

    title = Column(String(255), nullable=False)
    overview = Column(Text, nullable=True)
    release_date = Column(String(20), nullable=True)
    poster_path = Column(String(255), nullable=True)
    backdrop_path = Column(String(255), nullable=True)
    tmdb_rating = Column(Float, nullable=True)  # rating pulled from TMDB for reference
    runtime = Column(Integer, nullable=True)
    genres = Column(String(500), nullable=True)  # comma-separated genre names

    # --- Admin's own opinion (the showcase) ---
    admin_rating = Column(Float, nullable=False, default=0)  # 0-10
    admin_review = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user_ratings = relationship("UserRating", back_populates="movie", cascade="all, delete-orphan")


class UserRating(Base):
    """A regular user's personal rating/review of a showcased movie."""

    __tablename__ = "user_ratings"
    __table_args__ = (UniqueConstraint("user_id", "movie_id", name="uq_user_movie_rating"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)

    rating = Column(Float, nullable=False)  # 0-10
    review = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="ratings")
    movie = relationship("Movie", back_populates="user_ratings")
