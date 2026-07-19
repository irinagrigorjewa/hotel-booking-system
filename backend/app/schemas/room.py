from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import RoomStatus
from app.schemas.room_type import RoomTypeOut


class RoomHotelSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    city: str


class RoomImage(BaseModel):
    id: int
    url: str
    sort_order: int


class RoomCreate(BaseModel):
    hotel_id: int
    room_type_id: int
    number: str = Field(min_length=1, max_length=50)
    price: Decimal = Field(gt=0)
    capacity: int = Field(ge=1)
    description: str | None = None
    status: RoomStatus = RoomStatus.AVAILABLE


class RoomUpdate(RoomCreate):
    pass


class RoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hotel_id: int
    room_type_id: int
    number: str
    price: Decimal
    capacity: int
    description: str | None
    status: RoomStatus
    room_type: RoomTypeOut
    hotel: RoomHotelSummary
    images: list[RoomImage]


class RoomPage(BaseModel):
    items: list[RoomOut]
    total: int
    page: int
    size: int


class RoomListFilters(BaseModel):
    hotel_id: int | None = None
    city: str | None = None
    capacity: int | None = Field(default=None, ge=1)
    price_from: Decimal | None = Field(default=None, gt=0)
    price_to: Decimal | None = Field(default=None, gt=0)
    date_from: date | None = None
    date_to: date | None = None
