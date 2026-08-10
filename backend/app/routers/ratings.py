from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Movie, User, UserRating
from app.schemas import UserRatingCreate, UserRatingOut

router = APIRouter(prefix="/api/movies", tags=["ratings"])


@router.post("/{movie_id}/rate", response_model=UserRatingOut)
def rate_movie(
    movie_id: int,
    payload: UserRatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    rating = (
        db.query(UserRating)
        .filter(UserRating.movie_id == movie_id, UserRating.user_id == current_user.id)
        .first()
    )

    if rating:
        rating.rating = payload.rating
        rating.review = payload.review
    else:
        rating = UserRating(
            movie_id=movie_id,
            user_id=current_user.id,
            rating=payload.rating,
            review=payload.review,
        )
        db.add(rating)

    db.commit()
    db.refresh(rating)

    out = UserRatingOut.model_validate(rating)
    out.username = current_user.username
    return out


@router.get("/{movie_id}/my-rating", response_model=UserRatingOut)
def get_my_rating(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rating = (
        db.query(UserRating)
        .filter(UserRating.movie_id == movie_id, UserRating.user_id == current_user.id)
        .first()
    )
    if not rating:
        raise HTTPException(status_code=404, detail="You haven't rated this movie yet")

    out = UserRatingOut.model_validate(rating)
    out.username = current_user.username
    return out


@router.delete("/{movie_id}/rate", status_code=204)
def delete_my_rating(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rating = (
        db.query(UserRating)
        .filter(UserRating.movie_id == movie_id, UserRating.user_id == current_user.id)
        .first()
    )
    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found")
    db.delete(rating)
    db.commit()
    return None
