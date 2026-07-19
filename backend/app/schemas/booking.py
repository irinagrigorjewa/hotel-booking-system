from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import BookingStatus


class BookingCreate(BaseModel):
    room_id: int
    check_in: date
    check_out: date


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingRoomSummary(BaseModel):
    id: int
    number: str
    price: Decimal
    hotel_id: int
    hotel_name: str


class BookingUserSummary(BaseModel):
    id: int
    name: str
    email: str


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    room_id: int
    check_in: date
    check_out: date
    nights: int
    total_price: Decimal
    status: BookingStatus
    created_at: datetime
    room: BookingRoomSummary
    user: BookingUserSummary | None = None


class BookingPage(BaseModel):
    items: list[BookingOut]
    total: int
    page: int
    size: int
