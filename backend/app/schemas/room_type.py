from pydantic import BaseModel, ConfigDict, Field


class RoomTypeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class RoomTypeOut(RoomTypeCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class RoomTypePage(BaseModel):
    items: list[RoomTypeOut]
    total: int
    page: int
    size: int
