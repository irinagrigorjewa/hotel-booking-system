from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.room_type import RoomType
from app.repositories import room_types, rooms
from app.schemas.room_type import RoomTypeCreate, RoomTypeOut, RoomTypePage


class RoomTypeAlreadyExistsError(Exception):
    pass


class RoomTypeNotFoundError(Exception):
    pass


class RoomTypeHasRoomsError(Exception):
    pass


def get_room_types(session: Session, *, page: int, size: int) -> RoomTypePage:
    items, total = room_types.list_room_types(session, page=page, size=size)
    return RoomTypePage(
        items=[RoomTypeOut.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
    )


def create_room_type(session: Session, request: RoomTypeCreate) -> RoomTypeOut:
    try:
        room_type = room_types.create(session, **request.model_dump())
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise RoomTypeAlreadyExistsError from error

    session.refresh(room_type)
    return RoomTypeOut.model_validate(room_type)


def update_room_type(
    session: Session,
    room_type_id: int,
    request: RoomTypeCreate,
) -> RoomTypeOut:
    room_type = _get_room_type_or_raise(session, room_type_id)
    room_types.update(room_type, **request.model_dump())

    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        raise RoomTypeAlreadyExistsError from error

    session.refresh(room_type)
    return RoomTypeOut.model_validate(room_type)


def delete_room_type(session: Session, room_type_id: int) -> None:
    room_type = _get_room_type_or_raise(session, room_type_id)
    if rooms.count_rooms_for_type(session, room_type_id) > 0:
        raise RoomTypeHasRoomsError
    room_types.delete(session, room_type)
    session.commit()


def _get_room_type_or_raise(session: Session, room_type_id: int) -> RoomType:
    room_type = room_types.get_by_id(session, room_type_id)
    if room_type is None:
        raise RoomTypeNotFoundError
    return room_type
