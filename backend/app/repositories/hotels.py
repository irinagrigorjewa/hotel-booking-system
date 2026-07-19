from collections.abc import Sequence
from decimal import Decimal
from typing import Literal

from sqlalchemy import ColumnElement, Select, func, select
from sqlalchemy.orm import Session

from app.models.hotel import Hotel
from app.models.review import Review
from app.models.room import Room

HotelSort = Literal["created_at", "stars", "avg_rating"]
SortOrder = Literal["asc", "desc"]


def get_by_id(session: Session, hotel_id: int) -> Hotel | None:
    return session.get(Hotel, hotel_id)


def create(
    session: Session,
    *,
    name: str,
    city: str,
    address: str,
    description: str | None,
    stars: int,
    latitude: Decimal,
    longitude: Decimal,
) -> Hotel:
    hotel = Hotel(
        name=name,
        city=city,
        address=address,
        description=description,
        stars=stars,
        latitude=latitude,
        longitude=longitude,
    )
    session.add(hotel)
    session.flush()
    return hotel


def update(
    hotel: Hotel,
    *,
    name: str,
    city: str,
    address: str,
    description: str | None,
    stars: int,
    latitude: Decimal,
    longitude: Decimal,
) -> None:
    hotel.name = name
    hotel.city = city
    hotel.address = address
    hotel.description = description
    hotel.stars = stars
    hotel.latitude = latitude
    hotel.longitude = longitude


def delete(session: Session, hotel: Hotel) -> None:
    session.delete(hotel)


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
    avg_rating = func.avg(Review.rating).label("avg_rating")
    query: Select[tuple[Hotel]] = (
        select(Hotel)
        .outerjoin(Review, Review.hotel_id == Hotel.id)
        .where(*filters)
        .group_by(Hotel.id)
        .order_by(*_sort_expression(sort, order, avg_rating))
        .offset((page - 1) * size)
        .limit(size)
    )
    return session.scalars(query).all(), total


def list_for_map(
    session: Session,
    *,
    city: str | None,
) -> Sequence[tuple[Hotel, Decimal | None, float | None]]:
    filters = _build_filters(city=city, stars=None)
    min_price = func.min(Room.price).label("min_price")
    avg_rating = func.avg(Review.rating).label("avg_rating")
    rows = session.execute(
        select(Hotel, min_price, avg_rating)
        .outerjoin(Room, Room.hotel_id == Hotel.id)
        .outerjoin(Review, Review.hotel_id == Hotel.id)
        .where(*filters)
        .group_by(Hotel.id)
        .order_by(Hotel.id.asc())
    ).all()
    result: list[tuple[Hotel, Decimal | None, float | None]] = []
    for hotel, price, rating in rows:
        avg = round(float(rating), 1) if rating is not None else None
        result.append((hotel, price, avg))
    return result


def min_prices(
    session: Session,
    hotel_ids: Sequence[int],
) -> dict[int, Decimal | None]:
    if not hotel_ids:
        return {}
    rows = session.execute(
        select(Room.hotel_id, func.min(Room.price))
        .where(Room.hotel_id.in_(hotel_ids))
        .group_by(Room.hotel_id)
    ).all()
    prices: dict[int, Decimal | None] = {hotel_id: None for hotel_id in hotel_ids}
    for hotel_id, price in rows:
        prices[hotel_id] = price
    return prices


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
    avg_rating: ColumnElement[object],
) -> tuple[ColumnElement[object], ColumnElement[object]]:
    field: ColumnElement[object] = {
        "created_at": Hotel.created_at,
        "stars": Hotel.stars,
        "avg_rating": avg_rating,
    }[sort]
    direction = field.asc if order == "asc" else field.desc
    id_direction = Hotel.id.asc if order == "asc" else Hotel.id.desc
    return direction(), id_direction()
