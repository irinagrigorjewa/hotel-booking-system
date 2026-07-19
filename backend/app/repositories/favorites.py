from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.favorite import Favorite


class FavoriteAlreadyExistsError(Exception):
    pass


def get(session: Session, *, user_id: int, hotel_id: int) -> Favorite | None:
    return session.scalar(
        select(Favorite).where(Favorite.user_id == user_id, Favorite.hotel_id == hotel_id)
    )


def create(session: Session, *, user_id: int, hotel_id: int) -> Favorite:
    favorite = Favorite(user_id=user_id, hotel_id=hotel_id)
    session.add(favorite)
    try:
        session.flush()
    except IntegrityError as error:
        raise FavoriteAlreadyExistsError from error
    return favorite


def delete(session: Session, favorite: Favorite) -> None:
    session.delete(favorite)


def list_hotel_ids(
    session: Session,
    *,
    user_id: int,
    page: int,
    size: int,
) -> tuple[Sequence[int], int]:
    filters = [Favorite.user_id == user_id]
    total = session.scalar(select(func.count()).select_from(Favorite).where(*filters)) or 0
    rows = session.scalars(
        select(Favorite.hotel_id)
        .where(*filters)
        .order_by(Favorite.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    ).all()
    return rows, total


def favorite_hotel_ids(
    session: Session,
    *,
    user_id: int,
    hotel_ids: Sequence[int],
) -> set[int]:
    if not hotel_ids:
        return set()
    rows = session.scalars(
        select(Favorite.hotel_id).where(
            Favorite.user_id == user_id,
            Favorite.hotel_id.in_(hotel_ids),
        )
    ).all()
    return set(rows)
