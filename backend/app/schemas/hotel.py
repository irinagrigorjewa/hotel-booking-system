from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class HotelCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=500)
    description: str | None = None
    stars: int = Field(ge=1, le=5)
    latitude: Decimal = Field(ge=Decimal("-90"), le=Decimal("90"))
    longitude: Decimal = Field(ge=Decimal("-180"), le=Decimal("180"))


class HotelUpdate(HotelCreate):
    pass


class HotelListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    city: str
    address: str
    description: str | None
    stars: int
    latitude: Decimal
    longitude: Decimal
    created_at: datetime
    avg_rating: float | None
    reviews_count: int
    min_price: Decimal | None
    cover_image: None = None
    is_favorite: bool | None


class HotelImage(BaseModel):
    id: int
    url: str
    sort_order: int


class HotelDetail(HotelListItem):
    images: list[HotelImage]


class HotelPage(BaseModel):
    items: list[HotelListItem]
    total: int
    page: int
    size: int
