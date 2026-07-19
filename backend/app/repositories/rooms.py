from collections.abc import Sequence
from datetime import date
from decimal import Decimal

from sqlalchemy import ColumnElement, Select, exists, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.booking import Booking
from app.models.enums import BookingStatus, RoomStatus
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.room_type import RoomType

ACTIVE_BOOKING_STATUSES = (BookingStatus.PENDING, BookingStatus.CONFIRMED)


def dates_overlap(
    existing_check_in: date,
    existing_check_out: date,
    date_from: date,
    date_to: date,
) -> bool:
    return existing_check_in < date_to and date_from < existing_check_out


def get_by_id(session: Session, room_id: int) -> Room | None:
    return session.scalar(
        select(Room)
        .options(joinedload(Room.hotel), joinedload(Room.room_type))
        .where(Room.id == room_id)
    )


def get_by_id_plain(session: Session, room_id: int) -> Room | None:
    return session.get(Room, room_id)


def hotel_exists(session: Session, hotel_id: int) -> bool:
    return session.get(Hotel, hotel_id) is not None


def room_type_exists(session: Session, room_type_id: int) -> bool:
    return session.get(RoomType, room_type_id) is not None


def count_rooms_for_type(session: Session, room_type_id: int) -> int:
    return (
        session.scalar(
            select(func.count()).select_from(Room).where(Room.room_type_id == room_type_id)
        )
        or 0
    )


def has_active_bookings(session: Session, room_id: int) -> bool:
    return (
        session.scalar(
            select(func.count())
            .select_from(Booking)
            .where(
                Booking.room_id == room_id,
                Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            )
        )
        or 0
    ) > 0


def create(
    session: Session,
    *,
    hotel_id: int,
    room_type_id: int,
    number: str,
    price: Decimal,
    capacity: int,
    description: str | None,
    status: RoomStatus,
) -> Room:
    room = Room(
        hotel_id=hotel_id,
        room_type_id=room_type_id,
        number=number,
        price=price,
        capacity=capacity,
        description=description,
        status=status,
    )
    session.add(room)
    session.flush()
    return room


def update(
    room: Room,
    *,
    hotel_id: int,
    room_type_id: int,
    number: str,
    price: Decimal,
    capacity: int,
    description: str | None,
    status: RoomStatus,
) -> None:
    room.hotel_id = hotel_id
    room.room_type_id = room_type_id
    room.number = number
    room.price = price
    room.capacity = capacity
    room.description = description
    room.status = status


def delete(session: Session, room: Room) -> None:
    session.delete(room)


def list_rooms(
    session: Session,
    *,
    hotel_id: int | None,
    city: str | None,
    capacity: int | None,
    price_from: Decimal | None,
    price_to: Decimal | None,
    date_from: date | None,
    date_to: date | None,
    page: int,
    size: int,
) -> tuple[Sequence[Room], int]:
    filters = _build_filters(
        hotel_id=hotel_id,
        city=city,
        capacity=capacity,
        price_from=price_from,
        price_to=price_to,
        date_from=date_from,
        date_to=date_to,
    )
    base = select(Room).join(Hotel).where(*filters)
    total = session.scalar(select(func.count()).select_from(base.subquery())) or 0
    query: Select[tuple[Room]] = (
        select(Room)
        .join(Hotel)
        .options(joinedload(Room.hotel), joinedload(Room.room_type))
        .where(*filters)
        .order_by(Room.id.asc())
        .offset((page - 1) * size)
        .limit(size)
    )
    return session.scalars(query).unique().all(), total


def _build_filters(
    *,
    hotel_id: int | None,
    city: str | None,
    capacity: int | None,
    price_from: Decimal | None,
    price_to: Decimal | None,
    date_from: date | None,
    date_to: date | None,
) -> list[ColumnElement[bool]]:
    filters: list[ColumnElement[bool]] = []

    if hotel_id is not None:
        filters.append(Room.hotel_id == hotel_id)
    if city is not None:
        filters.append(func.lower(Hotel.city) == city.lower())
    if capacity is not None:
        filters.append(Room.capacity >= capacity)
    if price_from is not None:
        filters.append(Room.price >= price_from)
    if price_to is not None:
        filters.append(Room.price <= price_to)

    if date_from is not None and date_to is not None:
        filters.append(Room.status == RoomStatus.AVAILABLE)
        overlapping = exists(
            select(Booking.id).where(
                Booking.room_id == Room.id,
                Booking.status.in_(ACTIVE_BOOKING_STATUSES),
                Booking.check_in < date_to,
                date_from < Booking.check_out,
            )
        )
        filters.append(~overlapping)

    return filters
