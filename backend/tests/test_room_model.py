from decimal import Decimal

from sqlalchemy import CheckConstraint, UniqueConstraint

from app.database.base import Base
from app.models import Room
from app.models.enums import RoomStatus


def test_room_model_registers_catalog_schema() -> None:
    rooms = Base.metadata.tables["rooms"]

    assert Room.__table__ is rooms
    assert set(rooms.c.keys()) == {
        "id",
        "hotel_id",
        "room_type_id",
        "number",
        "price",
        "capacity",
        "description",
        "status",
    }
    assert rooms.c.description.nullable is True
    assert rooms.c.price.type.precision == 12
    assert rooms.c.price.type.scale == 2
    assert {index.name for index in rooms.indexes} == {
        "ix_rooms_hotel_id",
        "ix_rooms_room_type_id",
        "ix_rooms_price",
        "ix_rooms_capacity",
        "ix_rooms_status",
    }
    assert {
        constraint.name
        for constraint in rooms.constraints
        if isinstance(constraint, CheckConstraint)
    } == {
        "ck_rooms_price_positive",
        "ck_rooms_capacity",
    }
    assert {
        constraint.name
        for constraint in rooms.constraints
        if isinstance(constraint, UniqueConstraint)
    } == {"uq_rooms_hotel_number"}


def test_room_uses_decimal_price_and_status_enum() -> None:
    room = Room(
        hotel_id=1,
        room_type_id=1,
        number="301",
        price=Decimal("5500.00"),
        capacity=2,
        status=RoomStatus.AVAILABLE,
    )

    assert room.price == Decimal("5500.00")
    assert room.status is RoomStatus.AVAILABLE
