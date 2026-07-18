from collections.abc import Sequence
from typing import Literal

from sqlalchemy import ColumnElement, func, select
from sqlalchemy.orm import Session

from app.models.hotel import Hotel

HotelSort = Literal["created_at", "stars", "avg_rating"]
SortOrder = Literal["asc", "desc"]


def get_by_id(session: Session, hotel_id: int) -> Hotel | None:
    return session.get(Hotel, hotel_id)


def list_hotels(
    session: Session,
    *,
    city: str | None,
    stars: int | None,
    sort: HotelSort,
    order: SortOrder,
    page: int,
    size: int,
) -> tuple[Sequence[Hotel], int]:
    filters = _build_filters(city=city, stars=stars)
    total = session.scalar(select(func.count()).select_from(Hotel).where(*filters)) or 0
    query = (
        select(Hotel)
        .where(*filters)
        .order_by(*_sort_expression(sort, order))
        .offset((page - 1) * size)
        .limit(size)
    )
    return session.scalars(query).all(), total


def _build_filters(*, city: str | None, stars: int | None) -> list[ColumnElement[bool]]:
    filters: list[ColumnElement[bool]] = []
    if city is not None:
        filters.append(func.lower(Hotel.city) == city.lower())
    if stars is not None:
        filters.append(Hotel.stars == stars)
    return filters


def _sort_expression(
    sort: HotelSort,
    order: SortOrder,
) -> tuple[ColumnElement[object], ColumnElement[object]]:
    field = {
        "created_at": Hotel.created_at,
        "stars": Hotel.stars,
        "avg_rating": Hotel.created_at,
    }[sort]
    direction = field.asc if order == "asc" else field.desc
    id_direction = Hotel.id.asc if order == "asc" else Hotel.id.desc
    return direction(), id_direction()
