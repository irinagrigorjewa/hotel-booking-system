from datetime import date
from decimal import Decimal

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.enums import RoomStatus
from app.models.room import Room
from app.repositories import rooms
from app.schemas.room import (
    RoomCreate,
    RoomHotelSummary,
    RoomOut,
    RoomPage,
    RoomUpdate,
)
from app.schemas.room_type import RoomTypeOut


class RoomNotFoundError(Exception):
    pass


class RoomAlreadyExistsError(Exception):
    pass


class HotelNotFoundError(Exception):
    pass


class RoomTypeNotFoundError(Exception):
    pass


class InvalidDateRangeError(Exception):
    pass


class RoomHasActiveBookingsError(Exception):
    pass


def get_room(session: Session, room_id: int) -> RoomOut:
    room = rooms.get_by_id(session, room_id)
    if room is None:
        raise RoomNotFoundError
    return _to_out(room)


def get_rooms(
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
) -> RoomPage:
    _validate_date_filters(date_from=date_from, date_to=date_to)
    items, total = rooms.list_rooms(
        session,
        hotel_id=hotel_id,
        city=city,
        capacity=capacity,
        price_from=price_from,
        price_to=price_to,
        date_from=date_from,
        date_to=date_to,
        page=page,
        size=size,
    )
    return RoomPage(
        items=[_to_out(item) for item in items],
        total=total,
        page=page,
        size=size,
    )


def create_room(session: Session, request: RoomCreate) -> RoomOut:
    _ensure_references(session, request.hotel_id, request.room_type_id)
    try:
        room = rooms.create(session, **request.model_dump())
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise RoomAlreadyExistsError from error

    loaded = rooms.get_by_id(session, room.id)
    assert loaded is not None
    return _to_out(loaded)


def update_room(session: Session, room_id: int, request: RoomUpdate) -> RoomOut:
    room = _get_room_or_raise(session, room_id)
    _ensure_references(session, request.hotel_id, request.room_type_id)
    rooms.update(room, **request.model_dump())

    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise RoomAlreadyExistsError from error

    loaded = rooms.get_by_id(session, room_id)
    assert loaded is not None
    return _to_out(loaded)


def delete_room(session: Session, room_id: int) -> None:
    room = _get_room_or_raise(session, room_id)
    if rooms.has_active_bookings(session, room_id):
        raise RoomHasActiveBookingsError
    rooms.delete(session, room)
    session.commit()


def _get_room_or_raise(session: Session, room_id: int) -> Room:
    room = rooms.get_by_id_plain(session, room_id)
    if room is None:
        raise RoomNotFoundError
    return room


def _ensure_references(session: Session, hotel_id: int, room_type_id: int) -> None:
    if not rooms.hotel_exists(session, hotel_id):
        raise HotelNotFoundError
    if not rooms.room_type_exists(session, room_type_id):
        raise RoomTypeNotFoundError


def _validate_date_filters(*, date_from: date | None, date_to: date | None) -> None:
    if date_from is None and date_to is None:
        return
    if date_from is None or date_to is None or date_from >= date_to:
        raise InvalidDateRangeError


def _to_out(room: Room) -> RoomOut:
    return RoomOut(
        id=room.id,
        hotel_id=room.hotel_id,
        room_type_id=room.room_type_id,
        number=room.number,
        price=room.price,
        capacity=room.capacity,
        description=room.description,
        status=RoomStatus(room.status),
        room_type=RoomTypeOut.model_validate(room.room_type),
        hotel=RoomHotelSummary.model_validate(room.hotel),
        images=[],
    )
