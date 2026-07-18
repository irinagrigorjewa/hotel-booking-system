from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.schemas.hotel import HotelDetail, HotelPage
from app.services import hotels

router = APIRouter(prefix="/api/v1/hotels", tags=["Hotels"])
SessionDependency = Annotated[Session, Depends(get_session)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=HotelPage)
def list_hotels(
    session: SessionDependency,
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
    )


@router.get("/{hotel_id}", response_model=HotelDetail, responses={404: {"description": "Hotel not found"}})
def get_hotel(hotel_id: int, session: SessionDependency) -> HotelDetail:
    try:
        return hotels.get_hotel(session, hotel_id)
    except hotels.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error
