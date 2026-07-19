from datetime import date
from decimal import Decimal

from sqlalchemy import CheckConstraint, Index

from app.database.base import Base
from app.models import Booking
from app.models.enums import BookingStatus


def test_booking_model_registers_schema() -> None:
    bookings = Base.metadata.tables["bookings"]

    assert Booking.__table__ is bookings
    assert set(bookings.c.keys()) == {
        "id",
        "user_id",
        "room_id",
        "check_in",
        "check_out",
        "total_price",
        "status",
        "created_at",
    }
    assert {index.name for index in bookings.indexes} == {
        "ix_bookings_user_id",
        "ix_bookings_room_id",
        "ix_bookings_status",
        "ix_bookings_room_dates_status",
    }
    assert {
        constraint.name
        for constraint in bookings.constraints
        if isinstance(constraint, CheckConstraint)
    } == {
        "ck_bookings_dates",
        "ck_bookings_total_price",
    }
    assert any(
        isinstance(index, Index) and index.name == "ix_bookings_room_dates_status"
        for index in bookings.indexes
    )


def test_booking_uses_decimal_price_and_status_enum() -> None:
    booking = Booking(
        user_id=1,
        room_id=1,
        check_in=date(2026, 7, 10),
        check_out=date(2026, 7, 15),
        total_price=Decimal("27500.00"),
        status=BookingStatus.CONFIRMED,
    )

    assert booking.total_price == Decimal("27500.00")
    assert booking.status is BookingStatus.CONFIRMED
