from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import ImageEntityType
from app.models.image import Image
from app.repositories import hotels as hotels_repo
from app.repositories import images as images_repo
from app.repositories import rooms as rooms_repo
from app.schemas.image import ImageOut, ImageSortUpdate

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_IMAGES_PER_ENTITY = 10


class ImageNotFoundError(Exception):
    pass


class EntityNotFoundError(Exception):
    pass


class TooManyImagesError(Exception):
    pass


class UnsupportedMediaTypeError(Exception):
    pass


class PayloadTooLargeError(Exception):
    pass


def upload_hotel_image(
    session: Session,
    *,
    hotel_id: int,
    upload: UploadFile,
    sort_order: int,
) -> ImageOut:
    if hotels_repo.get_by_id(session, hotel_id) is None:
        raise EntityNotFoundError
    return _upload(
        session,
        entity_type=ImageEntityType.HOTEL,
        entity_id=hotel_id,
        upload=upload,
        sort_order=sort_order,
        folder="hotels",
    )


def upload_room_image(
    session: Session,
    *,
    room_id: int,
    upload: UploadFile,
    sort_order: int,
) -> ImageOut:
    if rooms_repo.get_by_id_plain(session, room_id) is None:
        raise EntityNotFoundError
    return _upload(
        session,
        entity_type=ImageEntityType.ROOM,
        entity_id=room_id,
        upload=upload,
        sort_order=sort_order,
        folder="rooms",
    )


def update_image_sort(
    session: Session,
    image_id: int,
    request: ImageSortUpdate,
) -> ImageOut:
    image = _get_or_raise(session, image_id)
    images_repo.update_sort_order(image, sort_order=request.sort_order)
    session.commit()
    session.refresh(image)
    return ImageOut.model_validate(image)


def delete_image(session: Session, image_id: int) -> None:
    image = _get_or_raise(session, image_id)
    file_path = _url_to_path(image.url)
    images_repo.delete(session, image)
    session.commit()
    if file_path.exists():
        file_path.unlink()


def delete_entity_images(
    session: Session,
    *,
    entity_type: ImageEntityType,
    entity_id: int,
) -> None:
    images = images_repo.delete_for_entity(
        session,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    for image in images:
        file_path = _url_to_path(image.url)
        if file_path.exists():
            file_path.unlink()


def list_image_dtos(
    session: Session,
    *,
    entity_type: ImageEntityType,
    entity_id: int,
) -> list[ImageOut]:
    return [
        ImageOut.model_validate(image)
        for image in images_repo.list_for_entity(
            session,
            entity_type=entity_type,
            entity_id=entity_id,
        )
    ]


def _upload(
    session: Session,
    *,
    entity_type: ImageEntityType,
    entity_id: int,
    upload: UploadFile,
    sort_order: int,
    folder: str,
) -> ImageOut:
    if images_repo.count_for_entity(
        session,
        entity_type=entity_type,
        entity_id=entity_id,
    ) >= MAX_IMAGES_PER_ENTITY:
        raise TooManyImagesError

    content_type = upload.content_type or ""
    extension = ALLOWED_CONTENT_TYPES.get(content_type)
    if extension is None:
        raise UnsupportedMediaTypeError

    payload = upload.file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(payload) > max_bytes:
        raise PayloadTooLargeError

    relative_dir = Path(folder) / str(entity_id)
    absolute_dir = settings.upload_dir / relative_dir
    absolute_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid4().hex}{extension}"
    absolute_path = absolute_dir / filename
    absolute_path.write_bytes(payload)

    url = f"/media/{relative_dir.as_posix()}/{filename}"
    try:
        image = images_repo.create(
            session,
            entity_type=entity_type,
            entity_id=entity_id,
            url=url,
            sort_order=sort_order,
        )
        session.commit()
    except Exception:
        if absolute_path.exists():
            absolute_path.unlink()
        session.rollback()
        raise

    session.refresh(image)
    return ImageOut.model_validate(image)


def _get_or_raise(session: Session, image_id: int) -> Image:
    image = images_repo.get_by_id(session, image_id)
    if image is None:
        raise ImageNotFoundError
    return image


def _url_to_path(url: str) -> Path:
    relative = url.removeprefix("/media/").lstrip("/")
    return settings.upload_dir / relative
