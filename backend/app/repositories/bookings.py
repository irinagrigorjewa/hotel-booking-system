from collections.abc import Sequence
from datetime import date
from decimal import Decimal

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.booking import Booking
from app.models.enums import BookingStatus
from app.models.room import Room
from app.repositories.rooms import ACTIVE_BOOKING_STATUSES


def get_by_id(session: Session, booking_id: int) -> Booking | None:
    return session.scalar(
        select(Booking)
        .options(
            joinedload(Booking.room).joinedload(Room.hotel),
            joinedload(Booking.user),
        )
        .where(Booking.id == booking_id)
    )


def lock_room(session: Session, room_id: int) -> Room | None:
    # Lock only the rooms row. Eager-loading hotel here would emit LEFT OUTER JOIN,
    # and Postgres rejects FOR UPDATE on the nullable side of an outer join.
    return session.scalar(
        select(Room).where(Room.id == room_id).with_for_update()
    )


def has_overlapping_booking(
    session: Session,
    *,
    room_id: int,
    check_in: date,
    check_out: date,
    exclude_booking_id: int | None = None,
) -> bool:
    query = select(Booking.id).where(
        Booking.room_id == room_id,
        Booking.status.in_(ACTIVE_BOOKING_STATUSES),
        Booking.check_in < check_out,
        check_in < Booking.check_out,
    )
    if exclude_booking_id is not None:
        query = query.where(Booking.id != exclude_booking_id)
    return session.scalar(query.limit(1)) is not None


def create(
    session: Session,
    *,
    user_id: int,
    room_id: int,
    check_in: date,
    check_out: date,
    total_price: Decimal,
    status: BookingStatus,
) -> Booking:
    booking = Booking(
        user_id=user_id,
        room_id=room_id,
        check_in=check_in,
        check_out=check_out,
        total_price=total_price,
        status=status,
    )
    session.add(booking)
    session.flush()
    return booking


def list_bookings(
    session: Session,
    *,
    user_id: int | None,
    status_filter: BookingStatus | None,
    page: int,
    size: int,
) -> tuple[Sequence[Booking], int]:
    filters = []
    if user_id is not None:
        filters.append(Booking.user_id == user_id)
    if status_filter is not None:
        filters.append(Booking.status == status_filter)

    base: Select[tuple[Booking]] = select(Booking).where(*filters)
    total = session.scalar(select(func.count()).select_from(base.subquery())) or 0
    query = (
        select(Booking)
        .options(
            joinedload(Booking.room).joinedload(Room.hotel),
            joinedload(Booking.user),
        )
        .where(*filters)
        .order_by(Booking.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    return session.scalars(query).unique().all(), total


def hotel_has_active_bookings(session: Session, hotel_id: int) -> bool:
    return (
        session.scalar(
            select(func.count())
            .select_from(Booking)
            .join(Room, Booking.room_id == Room.id)
            .where(
                Room.hotel_id == hotel_id,
                Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            )
        )
        or 0
    ) > 0
