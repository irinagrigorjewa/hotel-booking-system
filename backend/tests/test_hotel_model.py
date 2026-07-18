from decimal import Decimal

from sqlalchemy import CheckConstraint

from app.database.base import Base
from app.models import Hotel


def test_hotel_model_registers_catalog_schema() -> None:
    hotels = Base.metadata.tables["hotels"]

    assert Hotel.__table__ is hotels
    assert set(hotels.c.keys()) == {
        "id",
        "name",
        "city",
        "address",
        "description",
        "stars",
        "latitude",
        "longitude",
        "created_at",
    }
    assert hotels.c.description.nullable is True
    assert hotels.c.latitude.type.precision == 9
    assert hotels.c.latitude.type.scale == 6
    assert hotels.c.latitude.type.asdecimal is True
    assert hotels.c.longitude.type.precision == 9
    assert hotels.c.longitude.type.scale == 6
    assert hotels.c.longitude.type.asdecimal is True
    assert {index.name for index in hotels.indexes} == {
        "ix_hotels_city",
        "ix_hotels_stars",
        "ix_hotels_created_at",
    }
    assert {
        constraint.name
        for constraint in hotels.constraints
        if isinstance(constraint, CheckConstraint)
    } == {
        "ck_hotels_stars_range",
        "ck_hotels_latitude_range",
        "ck_hotels_longitude_range",
    }


def test_hotel_coordinates_use_decimal_values() -> None:
    hotel = Hotel(
        name="Hotel Moscow Center",
        city="Москва",
        address="ул. Тверская, 1",
        stars=4,
        latitude=Decimal("55.755800"),
        longitude=Decimal("37.617300"),
    )

    assert hotel.latitude == Decimal("55.755800")
    assert hotel.longitude == Decimal("37.617300")
