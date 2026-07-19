from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.enums import BookingStatus, RoomStatus, UserRole
from app.models.user import User
from app.repositories import bookings
from app.schemas.booking import (
    BookingCreate,
    BookingOut,
    BookingPage,
    BookingRoomSummary,
    BookingStatusUpdate,
    BookingUserSummary,
)


class BookingNotFoundError(Exception):
    pass


class RoomNotFoundError(Exception):
    pass


class RoomUnavailableError(Exception):
    pass


class InvalidBookingDatesError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class BookingOverlapError(Exception):
    pass


class BookingForbiddenError(Exception):
    pass


class BookingCancelNotAllowedError(Exception):
    pass


class InvalidStatusTransitionError(Exception):
    pass


_ALLOWED_TRANSITIONS: dict[BookingStatus, set[BookingStatus]] = {
    BookingStatus.PENDING: {BookingStatus.CONFIRMED, BookingStatus.CANCELLED},
    BookingStatus.CONFIRMED: {BookingStatus.CANCELLED, BookingStatus.COMPLETED},
    BookingStatus.CANCELLED: set(),
    BookingStatus.COMPLETED: set(),
}


def create_booking(
    session: Session,
    current_user: User,
    request: BookingCreate,
) -> BookingOut:
    nights = _validate_dates(request.check_in, request.check_out)
    room = bookings.lock_room(session, request.room_id)
    if room is None:
        raise RoomNotFoundError
    if room.status is not RoomStatus.AVAILABLE:
        raise RoomUnavailableError
    if bookings.has_overlapping_booking(
        session,
        room_id=room.id,
        check_in=request.check_in,
        check_out=request.check_out,
    ):
        raise BookingOverlapError

    total_price = (Decimal(nights) * room.price).quantize(Decimal("0.01"))
    booking = bookings.create(
        session,
        user_id=current_user.id,
        room_id=room.id,
        check_in=request.check_in,
        check_out=request.check_out,
        total_price=total_price,
        status=BookingStatus.CONFIRMED,
    )
    session.commit()
    created = bookings.get_by_id(session, booking.id)
    assert created is not None
    return _to_out(created, include_user=current_user.role is UserRole.ADMIN)


def list_bookings(
    session: Session,
    current_user: User,
    *,
    status_filter: BookingStatus | None,
    page: int,
    size: int,
) -> BookingPage:
    owner_id = None if current_user.role is UserRole.ADMIN else current_user.id
    items, total = bookings.list_bookings(
        session,
        user_id=owner_id,
        status_filter=status_filter,
        page=page,
        size=size,
    )
    include_user = current_user.role is UserRole.ADMIN
    return BookingPage(
        items=[_to_out(item, include_user=include_user) for item in items],
        total=total,
        page=page,
        size=size,
    )


def get_booking(session: Session, current_user: User, booking_id: int) -> BookingOut:
    booking = _get_or_raise(session, booking_id)
    _ensure_can_view(current_user, booking)
    return _to_out(booking, include_user=current_user.role is UserRole.ADMIN)


def cancel_booking(session: Session, current_user: User, booking_id: int) -> BookingOut:
    booking = _get_or_raise(session, booking_id)
    _ensure_can_manage(current_user, booking)
    if booking.status not in {BookingStatus.PENDING, BookingStatus.CONFIRMED}:
        raise BookingCancelNotAllowedError
    booking.status = BookingStatus.CANCELLED
    session.commit()
    refreshed = bookings.get_by_id(session, booking.id)
    assert refreshed is not None
    return _to_out(refreshed, include_user=current_user.role is UserRole.ADMIN)


def update_booking_status(
    session: Session,
    booking_id: int,
    request: BookingStatusUpdate,
) -> BookingOut:
    booking = _get_or_raise(session, booking_id)
    allowed = _ALLOWED_TRANSITIONS[booking.status]
    if request.status not in allowed:
        raise InvalidStatusTransitionError
    booking.status = request.status
    session.commit()
    refreshed = bookings.get_by_id(session, booking.id)
    assert refreshed is not None
    return _to_out(refreshed, include_user=True)


def _validate_dates(check_in: date, check_out: date) -> int:
    if check_out <= check_in:
        raise InvalidBookingDatesError("check_out must be after check_in")
    nights = (check_out - check_in).days
    if nights < 1 or nights > 30:
        raise InvalidBookingDatesError("nights must be between 1 and 30")
    today = datetime.now(UTC).date()
    if check_in < today:
        raise InvalidBookingDatesError("check_in must be today or later")
    return nights


def _get_or_raise(session: Session, booking_id: int) -> Booking:
    booking = bookings.get_by_id(session, booking_id)
    if booking is None:
        raise BookingNotFoundError
    return booking


def _ensure_can_view(current_user: User, booking: Booking) -> None:
    if current_user.role is UserRole.ADMIN:
        return
    if booking.user_id != current_user.id:
        raise BookingForbiddenError


def _ensure_can_manage(current_user: User, booking: Booking) -> None:
    _ensure_can_view(current_user, booking)


def _to_out(booking: Booking, *, include_user: bool) -> BookingOut:
    room = booking.room
    return BookingOut(
        id=booking.id,
        user_id=booking.user_id,
        room_id=booking.room_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        nights=(booking.check_out - booking.check_in).days,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        room=BookingRoomSummary(
            id=room.id,
            number=room.number,
            price=room.price,
            hotel_id=room.hotel_id,
            hotel_name=room.hotel.name,
        ),
        user=(
            BookingUserSummary(
                id=booking.user.id,
                name=booking.user.name,
                email=booking.user.email,
            )
            if include_user
            else None
        ),
    )
