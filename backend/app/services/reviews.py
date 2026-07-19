from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.review import Review
from app.models.user import User
from app.repositories import hotels, reviews
from app.schemas.review import ReviewCreate, ReviewOut, ReviewPage, ReviewUpdate


class HotelNotFoundError(Exception):
    pass


class ReviewNotFoundError(Exception):
    pass


class ReviewForbiddenError(Exception):
    pass


class ReviewAlreadyExistsError(Exception):
    pass


def list_hotel_reviews(
    session: Session,
    hotel_id: int,
    *,
    order: reviews.SortOrder,
    page: int,
    size: int,
) -> ReviewPage:
    if hotels.get_by_id(session, hotel_id) is None:
        raise HotelNotFoundError
    items, total = reviews.list_for_hotel(
        session,
        hotel_id=hotel_id,
        order=order,
        page=page,
        size=size,
    )
    return ReviewPage(
        items=[_to_out(item) for item in items],
        total=total,
        page=page,
        size=size,
    )


def create_review(
    session: Session,
    hotel_id: int,
    current_user: User,
    request: ReviewCreate,
) -> ReviewOut:
    if hotels.get_by_id(session, hotel_id) is None:
        raise HotelNotFoundError
    if reviews.get_by_user_hotel(
        session,
        user_id=current_user.id,
        hotel_id=hotel_id,
    ) is not None:
        raise ReviewAlreadyExistsError
    try:
        review = reviews.create(
            session,
            hotel_id=hotel_id,
            user_id=current_user.id,
            rating=request.rating,
            comment=request.comment,
        )
    except reviews.ReviewAlreadyExistsError as error:
        raise ReviewAlreadyExistsError from error
    session.commit()
    created = reviews.get_by_id(session, review.id)
    assert created is not None
    return _to_out(created)


def update_review(
    session: Session,
    review_id: int,
    current_user: User,
    request: ReviewUpdate,
) -> ReviewOut:
    review = _get_or_raise(session, review_id)
    if review.user_id != current_user.id:
        raise ReviewForbiddenError
    payload = request.model_dump(exclude_unset=True)
    if "rating" in payload and payload["rating"] is not None:
        review.rating = payload["rating"]
    if "comment" in payload and payload["comment"] is not None:
        review.comment = payload["comment"]
    session.commit()
    refreshed = reviews.get_by_id(session, review.id)
    assert refreshed is not None
    return _to_out(refreshed)


def delete_review(session: Session, review_id: int, current_user: User) -> None:
    review = _get_or_raise(session, review_id)
    if review.user_id != current_user.id and current_user.role is not UserRole.ADMIN:
        raise ReviewForbiddenError
    session.delete(review)
    session.commit()


def _get_or_raise(session: Session, review_id: int) -> Review:
    review = reviews.get_by_id(session, review_id)
    if review is None:
        raise ReviewNotFoundError
    return review


def _to_out(review: Review) -> ReviewOut:
    return ReviewOut(
        id=review.id,
        hotel_id=review.hotel_id,
        user_id=review.user_id,
        user_name=review.user.name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )
