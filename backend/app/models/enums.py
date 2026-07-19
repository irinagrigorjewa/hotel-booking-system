from enum import StrEnum


class UserRole(StrEnum):
    CLIENT = "CLIENT"
    ADMIN = "ADMIN"


class RoomStatus(StrEnum):
    AVAILABLE = "AVAILABLE"
    MAINTENANCE = "MAINTENANCE"


class BookingStatus(StrEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
