from datetime import date
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database.session import get_session
from app.models.user import User
from app.schemas.room import RoomCreate, RoomOut, RoomPage, RoomUpdate
from app.services import rooms

router = APIRouter(prefix="/api/v1/rooms", tags=["Rooms"])
SessionDependency = Annotated[Session, Depends(get_session)]
AdminDependency = Annotated[User, Depends(require_admin)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=RoomPage)
def list_rooms(
    session: SessionDependency,
    hotel_id: int | None = None,
    city: str | None = None,
    capacity: Annotated[int | None, Query(ge=1)] = None,
    price_from: Annotated[Decimal | None, Query(gt=0)] = None,
    price_to: Annotated[Decimal | None, Query(gt=0)] = None,
    date_from: date | None = None,
    date_to: date | None = None,
    page: PageQuery = 1,
    size: SizeQuery = 20,
) -> RoomPage:
    try:
        return rooms.get_rooms(
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
    except rooms.InvalidDateRangeError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid date range",
        ) from error


@router.post("", response_model=RoomOut, status_code=status.HTTP_201_CREATED)
def create_room(
    request: RoomCreate,
    session: SessionDependency,
    _: AdminDependency,
) -> RoomOut:
    try:
        return rooms.create_room(session, request)
    except rooms.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error
    except rooms.RoomTypeNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room type not found",
        ) from error
    except rooms.RoomAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room number already exists",
        ) from error


@router.get(
    "/{room_id}",
    response_model=RoomOut,
    responses={404: {"description": "Room not found"}},
)
def get_room(room_id: int, session: SessionDependency) -> RoomOut:
    try:
        return rooms.get_room(session, room_id)
    except rooms.RoomNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        ) from error


@router.put(
    "/{room_id}",
    response_model=RoomOut,
    responses={404: {"description": "Room not found"}},
)
def update_room(
    room_id: int,
    request: RoomUpdate,
    session: SessionDependency,
    _: AdminDependency,
) -> RoomOut:
    try:
        return rooms.update_room(session, room_id, request)
    except rooms.RoomNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        ) from error
    except rooms.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error
    except rooms.RoomTypeNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room type not found",
        ) from error
    except rooms.RoomAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room number already exists",
        ) from error


@router.delete(
    "/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={404: {"description": "Room not found"}},
)
def delete_room(
    room_id: int,
    session: SessionDependency,
    _: AdminDependency,
) -> Response:
    try:
        rooms.delete_room(session, room_id)
    except rooms.RoomNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found",
        ) from error
    except rooms.RoomHasActiveBookingsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room has active bookings",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
