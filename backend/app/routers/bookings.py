from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database.session import get_session
from app.models.enums import BookingStatus
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingOut, BookingPage, BookingStatusUpdate
from app.services import bookings

router = APIRouter(prefix="/api/v1/bookings", tags=["Bookings"])
SessionDependency = Annotated[Session, Depends(get_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]
AdminDependency = Annotated[User, Depends(require_admin)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=BookingPage)
def list_bookings(
    session: SessionDependency,
    current_user: CurrentUserDependency,
    status_filter: Annotated[BookingStatus | None, Query(alias="status")] = None,
    page: PageQuery = 1,
    size: SizeQuery = 20,
) -> BookingPage:
    return bookings.list_bookings(
        session,
        current_user,
        status_filter=status_filter,
        page=page,
        size=size,
    )


@router.post(
    "",
    response_model=BookingOut,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "Invalid booking"},
        404: {"description": "Room not found"},
        409: {"description": "Overlap"},
    },
)
def create_booking(
    request: BookingCreate,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> BookingOut:
    try:
        return bookings.create_booking(session, current_user, request)
    except bookings.RoomNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        ) from error
    except bookings.RoomUnavailableError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available",
        ) from error
    except bookings.InvalidBookingDatesError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error.message,
        ) from error
    except bookings.BookingOverlapError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Booking dates overlap with an existing booking",
        ) from error


@router.get(
    "/{booking_id}",
    response_model=BookingOut,
    responses={403: {"description": "Forbidden"}, 404: {"description": "Not found"}},
)
def get_booking(
    booking_id: int,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> BookingOut:
    try:
        return bookings.get_booking(session, current_user, booking_id)
    except bookings.BookingNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        ) from error
    except bookings.BookingForbiddenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        ) from error


@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingOut,
    responses={
        400: {"description": "Cancel not allowed"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    },
)
def cancel_booking(
    booking_id: int,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> BookingOut:
    try:
        return bookings.cancel_booking(session, current_user, booking_id)
    except bookings.BookingNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        ) from error
    except bookings.BookingForbiddenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        ) from error
    except bookings.BookingCancelNotAllowedError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be cancelled",
        ) from error


@router.patch(
    "/{booking_id}",
    response_model=BookingOut,
    responses={
        400: {"description": "Invalid status transition"},
        404: {"description": "Not found"},
    },
)
def update_booking_status(
    booking_id: int,
    request: BookingStatusUpdate,
    session: SessionDependency,
    _: AdminDependency,
) -> BookingOut:
    try:
        return bookings.update_booking_status(session, booking_id, request)
    except bookings.BookingNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        ) from error
    except bookings.InvalidStatusTransitionError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status transition",
        ) from error
