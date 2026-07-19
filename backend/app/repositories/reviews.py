from collections.abc import Sequence
from typing import Literal

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.review import Review

SortOrder = Literal["asc", "desc"]


class ReviewAlreadyExistsError(Exception):
    pass


def get_by_id(session: Session, review_id: int) -> Review | None:
    return session.scalar(
        select(Review).options(joinedload(Review.user)).where(Review.id == review_id)
    )


def get_by_user_hotel(
    session: Session,
    *,
    user_id: int,
    hotel_id: int,
) -> Review | None:
    return session.scalar(
        select(Review).where(Review.user_id == user_id, Review.hotel_id == hotel_id)
    )


def create(
    session: Session,
    *,
    hotel_id: int,
    user_id: int,
    rating: int,
    comment: str,
) -> Review:
    review = Review(
        hotel_id=hotel_id,
        user_id=user_id,
        rating=rating,
        comment=comment,
    )
    session.add(review)
    try:
        session.flush()
    except IntegrityError as error:
        raise ReviewAlreadyExistsError from error
    return review


def list_for_hotel(
    session: Session,
    *,
    hotel_id: int,
    order: SortOrder,
    page: int,
    size: int,
) -> tuple[Sequence[Review], int]:
    filters = [Review.hotel_id == hotel_id]
    total = session.scalar(select(func.count()).select_from(Review).where(*filters)) or 0
    created_order = Review.created_at.asc() if order == "asc" else Review.created_at.desc()
    query = (
        select(Review)
        .options(joinedload(Review.user))
        .where(*filters)
        .order_by(created_order, Review.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    return session.scalars(query).unique().all(), total


def rating_stats(
    session: Session,
    hotel_ids: Sequence[int],
) -> dict[int, tuple[float | None, int]]:
    if not hotel_ids:
        return {}

    rows = session.execute(
        select(
            Review.hotel_id,
            func.avg(Review.rating),
            func.count(Review.id),
        )
        .where(Review.hotel_id.in_(hotel_ids))
        .group_by(Review.hotel_id)
    ).all()

    stats = {hotel_id: (None, 0) for hotel_id in hotel_ids}
    for hotel_id, average, count in rows:
        stats[hotel_id] = (round(float(average), 1) if average is not None else None, int(count))
    return stats
