from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import UserRole


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str | None
    role: UserRole
    created_at: datetime


class UserPage(BaseModel):
    items: list[UserPublic]
    total: int
    page: int
    size: int


class UserMeUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=32)

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "UserMeUpdate":
        if self.name is None and "phone" not in self.model_fields_set:
            raise ValueError("At least one of name or phone must be provided")
        return self


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=32)
    role: UserRole | None = None

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "UserUpdate":
        if (
            self.name is None
            and "phone" not in self.model_fields_set
            and self.role is None
        ):
            raise ValueError("At least one of name, phone, or role must be provided")
        return self
