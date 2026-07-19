from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ImageEntityType


class ImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    sort_order: int
    entity_type: ImageEntityType
    entity_id: int


class ImageSortUpdate(BaseModel):
    sort_order: int = Field(ge=0)
