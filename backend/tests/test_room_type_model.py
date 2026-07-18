import pytest
from sqlalchemy import UniqueConstraint, create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.base import Base
from app.models import RoomType


def test_room_type_model_registers_unique_name_schema() -> None:
    room_types = Base.metadata.tables["room_types"]

    assert RoomType.__table__ is room_types
    assert set(room_types.c.keys()) == {"id", "name"}
    assert room_types.c.name.nullable is False
    assert room_types.c.name.type.length == 100
    assert {
        constraint.name
        for constraint in room_types.constraints
        if isinstance(constraint, UniqueConstraint)
    } == {
        "uq_room_types_name"
    }


def test_room_type_name_must_be_unique() -> None:
    engine = create_engine("sqlite://")
    RoomType.__table__.create(engine)

    with Session(engine) as session:
        session.add_all([RoomType(name="Standard"), RoomType(name="Standard")])

        with pytest.raises(IntegrityError):
            session.commit()
