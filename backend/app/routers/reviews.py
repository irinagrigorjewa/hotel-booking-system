from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_session
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut, ReviewPage, ReviewUpdate
from app.services import reviews

hotels_reviews_router = APIRouter(prefix="/api/v1/hotels", tags=["Reviews"])
reviews_router = APIRouter(prefix="/api/v1/reviews", tags=["Reviews"])
SessionDependency = Annotated[Session, Depends(get_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@hotels_reviews_router.get(
    "/{hotel_id}/reviews",
    response_model=ReviewPage,
    responses={404: {"description": "Hotel not found"}},
)
def list_hotel_reviews(
    hotel_id: int,
    session: SessionDependency,
    order: Literal["asc", "desc"] = "desc",
    page: PageQuery = 1,
    size: SizeQuery = 20,
) -> ReviewPage:
    try:
        return reviews.list_hotel_reviews(
            session,
            hotel_id,
            order=order,
            page=page,
            size=size,
        )
    except reviews.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error


@hotels_reviews_router.post(
    "/{hotel_id}/reviews",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"description": "Hotel not found"},
        409: {"description": "Review already exists"},
    },
)
def create_hotel_review(
    hotel_id: int,
    request: ReviewCreate,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> ReviewOut:
    try:
        return reviews.create_review(session, hotel_id, current_user, request)
    except reviews.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error
    except reviews.ReviewAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Review already exists",
        ) from error


@reviews_router.patch(
    "/{review_id}",
    response_model=ReviewOut,
    responses={
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    },
)
def update_review(
    review_id: int,
    request: ReviewUpdate,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> ReviewOut:
    try:
        return reviews.update_review(session, review_id, current_user, request)
    except reviews.ReviewNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        ) from error
    except reviews.ReviewForbiddenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        ) from error


@reviews_router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    },
)
def delete_review(
    review_id: int,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> Response:
    try:
        reviews.delete_review(session, review_id, current_user)
    except reviews.ReviewNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        ) from error
    except reviews.ReviewForbiddenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        ) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
