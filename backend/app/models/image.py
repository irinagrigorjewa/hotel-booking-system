from datetime import datetime

from sqlalchemy import DateTime, Enum, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.enums import ImageEntityType


class Image(Base):
    __tablename__ = "images"
    __table_args__ = (
        Index("ix_images_entity_type_entity_id", "entity_type", "entity_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    entity_type: Mapped[ImageEntityType] = mapped_column(
        Enum(ImageEntityType, name="image_entity_type"),
    )
    entity_id: Mapped[int] = mapped_column(Integer)
    url: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
