from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=10, max_length=2000)


class ReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, min_length=10, max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hotel_id: int
    user_id: int
    user_name: str
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime


class ReviewPage(BaseModel):
    items: list[ReviewOut]
    total: int
    page: int
    size: int
