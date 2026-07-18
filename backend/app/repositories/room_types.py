from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.room_type import RoomType


def get_by_id(session: Session, room_type_id: int) -> RoomType | None:
    return session.get(RoomType, room_type_id)


def list_room_types(
    session: Session,
    *,
    page: int,
    size: int,
) -> tuple[Sequence[RoomType], int]:
    total = session.scalar(select(func.count()).select_from(RoomType)) or 0
    query = select(RoomType).order_by(RoomType.id).offset((page - 1) * size).limit(size)
    return session.scalars(query).all(), total


def create(session: Session, *, name: str) -> RoomType:
    room_type = RoomType(name=name)
    session.add(room_type)
    session.flush()
    return room_type


def update(room_type: RoomType, *, name: str) -> None:
    room_type.name = name


def delete(session: Session, room_type: RoomType) -> None:
    session.delete(room_type)
