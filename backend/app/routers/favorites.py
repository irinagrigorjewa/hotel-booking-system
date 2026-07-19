from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_session
from app.models.user import User
from app.schemas.favorite import FavoriteCreated
from app.schemas.hotel import HotelPage
from app.services import favorites

router = APIRouter(prefix="/api/v1/favorites", tags=["Favorites"])
SessionDependency = Annotated[Session, Depends(get_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=HotelPage)
def list_favorites(
    session: SessionDependency,
    current_user: CurrentUserDependency,
    page: PageQuery = 1,
    size: SizeQuery = 20,
) -> HotelPage:
    return favorites.list_favorites(session, current_user, page=page, size=size)


@router.post(
    "/{hotel_id}",
    response_model=FavoriteCreated,
    status_code=status.HTTP_201_CREATED,
    responses={
        404: {"description": "Hotel not found"},
        409: {"description": "Already favorited"},
    },
)
def add_favorite(
    hotel_id: int,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> FavoriteCreated:
    try:
        return favorites.add_favorite(session, current_user, hotel_id)
    except favorites.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error
    except favorites.FavoriteAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Hotel already in favorites",
        ) from error


@router.delete(
    "/{hotel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={404: {"description": "Not found"}},
)
def remove_favorite(
    hotel_id: int,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> Response:
    try:
        favorites.remove_favorite(session, current_user, hotel_id)
    except favorites.HotelNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found",
        ) from error
    except favorites.FavoriteNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        ) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
