from datetime import datetime

from pydantic import BaseModel

from app.schemas.hotel import HotelListItem, HotelPage


class FavoriteCreated(BaseModel):
    hotel_id: int
    user_id: int
    created_at: datetime


class FavoritePage(HotelPage):
    """Paginated favorite hotels as HotelListItem with is_favorite=true."""
