from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.enums import RoomStatus


class Room(Base):
    __tablename__ = "rooms"
    __table_args__ = (
        UniqueConstraint("hotel_id", "number", name="uq_rooms_hotel_number"),
        CheckConstraint("price > 0", name="ck_rooms_price_positive"),
        CheckConstraint("capacity >= 1", name="ck_rooms_capacity"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id"), index=True)
    room_type_id: Mapped[int] = mapped_column(ForeignKey("room_types.id"), index=True)
    number: Mapped[str] = mapped_column(String(50))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), index=True)
    capacity: Mapped[int] = mapped_column(Integer, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[RoomStatus] = mapped_column(
        Enum(RoomStatus, name="room_status"),
        index=True,
    )
