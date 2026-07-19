from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.database.session import get_session
from app.models.user import User
from app.schemas.image import ImageOut, ImageSortUpdate
from app.services import images

router = APIRouter(tags=["Images"])
SessionDependency = Annotated[Session, Depends(get_session)]
AdminDependency = Annotated[User, Depends(require_admin)]


def _map_upload_errors(error: Exception) -> HTTPException:
    if isinstance(error, images.EntityNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
    if isinstance(error, images.TooManyImagesError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Maximum number of images reached",
        )
    if isinstance(error, images.UnsupportedMediaTypeError):
        return HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported media type",
        )
    if isinstance(error, images.PayloadTooLargeError):
        return HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large",
        )
    if isinstance(error, images.ImageNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    raise error


@router.post(
    "/api/v1/hotels/{hotel_id}/images",
    response_model=ImageOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_hotel_image(
    hotel_id: int,
    session: SessionDependency,
    _: AdminDependency,
    file: UploadFile = File(...),
    sort_order: int = Form(0),
) -> ImageOut:
    try:
        return images.upload_hotel_image(
            session,
            hotel_id=hotel_id,
            upload=file,
            sort_order=sort_order,
        )
    except Exception as error:
        raise _map_upload_errors(error) from error


@router.post(
    "/api/v1/rooms/{room_id}/images",
    response_model=ImageOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_room_image(
    room_id: int,
    session: SessionDependency,
    _: AdminDependency,
    file: UploadFile = File(...),
    sort_order: int = Form(0),
) -> ImageOut:
    try:
        return images.upload_room_image(
            session,
            room_id=room_id,
            upload=file,
            sort_order=sort_order,
        )
    except Exception as error:
        raise _map_upload_errors(error) from error


@router.patch("/api/v1/images/{image_id}", response_model=ImageOut)
def patch_image(
    image_id: int,
    request: ImageSortUpdate,
    session: SessionDependency,
    _: AdminDependency,
) -> ImageOut:
    try:
        return images.update_image_sort(session, image_id, request)
    except images.ImageNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        ) from error


@router.delete(
    "/api/v1/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def remove_image(
    image_id: int,
    session: SessionDependency,
    _: AdminDependency,
) -> Response:
    try:
        images.delete_image(session, image_id)
    except images.ImageNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
