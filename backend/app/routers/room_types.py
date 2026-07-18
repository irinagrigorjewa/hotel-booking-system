from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database.session import get_session
from app.models.user import User
from app.schemas.room_type import RoomTypeCreate, RoomTypeOut, RoomTypePage
from app.services import room_types

router = APIRouter(prefix="/api/v1/room-types", tags=["Room types"])
SessionDependency = Annotated[Session, Depends(get_session)]
AdminDependency = Annotated[User, Depends(require_admin)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=RoomTypePage)
def list_room_types(
    session: SessionDependency,
    page: PageQuery = 1,
    size: SizeQuery = 20,
) -> RoomTypePage:
    return room_types.get_room_types(session, page=page, size=size)


@router.post(
    "",
    response_model=RoomTypeOut,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"description": "Room type already exists"}},
)
def create_room_type(
    request: RoomTypeCreate,
    session: SessionDependency,
    _: AdminDependency,
) -> RoomTypeOut:
    try:
        return room_types.create_room_type(session, request)
    except room_types.RoomTypeAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room type already exists",
        ) from error


@router.put(
    "/{room_type_id}",
    response_model=RoomTypeOut,
    responses={
        404: {"description": "Room type not found"},
        409: {"description": "Room type already exists"},
    },
)
def update_room_type(
    room_type_id: int,
    request: RoomTypeCreate,
    session: SessionDependency,
    _: AdminDependency,
) -> RoomTypeOut:
    try:
        return room_types.update_room_type(session, room_type_id, request)
    except room_types.RoomTypeNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room type not found",
        ) from error
    except room_types.RoomTypeAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room type already exists",
        ) from error


@router.delete(
    "/{room_type_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={404: {"description": "Room type not found"}},
)
def delete_room_type(
    room_type_id: int,
    session: SessionDependency,
    _: AdminDependency,
) -> Response:
    try:
        room_types.delete_room_type(session, room_type_id)
    except room_types.RoomTypeNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room type not found",
        ) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
