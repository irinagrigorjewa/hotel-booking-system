from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import OptionalUserDependency, require_admin
from app.database.session import get_session
from app.models.user import User
from app.schemas.hotel import HotelCreate, HotelDetail, HotelMapResponse, HotelPage, HotelUpdate
from app.services import hotels

router = APIRouter(prefix="/api/v1/hotels", tags=["Hotels"])
SessionDependency = Annotated[Session, Depends(get_session)]
AdminDependency = Annotated[User, Depends(require_admin)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=HotelPage)
def list_hotels(
    session: SessionDependency,
    current_user: OptionalUserDependency,
    city: str | None = None,
    stars: Annotated[int | None, Query(ge=1, le=5)] = None,
    sort: Literal["created_at", "stars", "avg_rating"] = "created_at",
    order: Literal["asc", "desc"] = "desc",
    page: PageQuery = 1,
    size: SizeQuery = 20,
) -> HotelPage:
    return hotels.get_hotels(
        session,
        city=city,
        stars=stars,
        sort=sort,
        order=order,
        page=page,
        size=size,
        current_user=current_user,
    )


@router.get("/map", response_model=HotelMapResponse)
def list_hotels_map(
    session: SessionDependency,
    city: str | None = None,
) -> HotelMapResponse:
    return hotels.get_hotels_map(session, city=city)


@router.post("", response_model=HotelDetail, status_code=status.HTTP_201_CREATED)
def create_hotel(
    request: HotelCreate,
    session: SessionDependency,
    _: AdminDependency,
) -> HotelDetail:
    return hotels.create_hotel(session, request)


@router.get("/{hotel_id}", response_model=HotelDetail, responses={404: {"description": "Hotel not found"}})
def get_hotel(
    hotel_id: int,
    session: SessionDependency,
    current_user: OptionalUserDependency,
) -> HotelDetail:
    try:
        return hotels.get_hotel(session, hotel_id, current_user=current_user)
    except hotels.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error


@router.put("/{hotel_id}", response_model=HotelDetail, responses={404: {"description": "Hotel not found"}})
def update_hotel(
    hotel_id: int,
    request: HotelUpdate,
    session: SessionDependency,
    _: AdminDependency,
) -> HotelDetail:
    try:
        return hotels.update_hotel(session, hotel_id, request)
    except hotels.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error


@router.delete(
    "/{hotel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={
        404: {"description": "Hotel not found"},
        409: {"description": "Active bookings exist"},
    },
)
def delete_hotel(
    hotel_id: int,
    session: SessionDependency,
    _: AdminDependency,
) -> Response:
    try:
        hotels.delete_hotel(session, hotel_id)
    except hotels.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error
    except hotels.HotelHasActiveBookingsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete: active bookings exist",
        ) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
