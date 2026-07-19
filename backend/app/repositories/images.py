from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import ImageEntityType
from app.models.image import Image


def get_by_id(session: Session, image_id: int) -> Image | None:
    return session.get(Image, image_id)


def list_for_entity(
    session: Session,
    *,
    entity_type: ImageEntityType,
    entity_id: int,
) -> Sequence[Image]:
    return session.scalars(
        select(Image)
        .where(
            Image.entity_type == entity_type,
            Image.entity_id == entity_id,
        )
        .order_by(Image.sort_order.asc(), Image.id.asc())
    ).all()


def count_for_entity(
    session: Session,
    *,
    entity_type: ImageEntityType,
    entity_id: int,
) -> int:
    return (
        session.scalar(
            select(func.count())
            .select_from(Image)
            .where(
                Image.entity_type == entity_type,
                Image.entity_id == entity_id,
            )
        )
        or 0
    )


def create(
    session: Session,
    *,
    entity_type: ImageEntityType,
    entity_id: int,
    url: str,
    sort_order: int,
) -> Image:
    image = Image(
        entity_type=entity_type,
        entity_id=entity_id,
        url=url,
        sort_order=sort_order,
    )
    session.add(image)
    session.flush()
    return image


def update_sort_order(image: Image, *, sort_order: int) -> None:
    image.sort_order = sort_order


def delete(session: Session, image: Image) -> None:
    session.delete(image)


def delete_for_entity(
    session: Session,
    *,
    entity_type: ImageEntityType,
    entity_id: int,
) -> Sequence[Image]:
    images = list_for_entity(session, entity_type=entity_type, entity_id=entity_id)
    for image in images:
        session.delete(image)
    return images
