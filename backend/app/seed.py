"""Idempotent demo seed for Compose / local startups."""

from __future__ import annotations

from decimal import Decimal
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.enums import ImageEntityType, RoomStatus, UserRole
from app.models.hotel import Hotel
from app.models.image import Image
from app.models.review import Review
from app.models.room import Room
from app.models.room_type import RoomType
from app.models.user import User
from app.repositories.users import get_by_email

ADMIN_EMAIL = "admin@hotel.local"
CLIENT_EMAIL = "client@hotel.local"
ADMIN_PASSWORD = "Admin123!"
CLIENT_PASSWORD = "Client123!"

# Minimal valid 1x1 PNG
_SEED_PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082"
)


def run_seed(session: Session, *, upload_dir: Path | None = None) -> bool:
    """Insert demo data once. Returns True if seed ran, False if skipped."""
    if get_by_email(session, ADMIN_EMAIL) is not None:
        return False

    root = upload_dir or settings.upload_dir
    root.mkdir(parents=True, exist_ok=True)

    admin = User(
        name="Admin",
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        phone=None,
        role=UserRole.ADMIN,
    )
    client = User(
        name="Client",
        email=CLIENT_EMAIL,
        password_hash=hash_password(CLIENT_PASSWORD),
        phone="+79001234567",
        role=UserRole.CLIENT,
    )
    session.add_all([admin, client])
    session.flush()

    room_types = [
        RoomType(name="Standard"),
        RoomType(name="Deluxe"),
        RoomType(name="Suite"),
    ]
    session.add_all(room_types)
    session.flush()

    moscow = Hotel(
        name="Hotel Moscow Center",
        city="Москва",
        address="Тверская 1",
        description="Уютный отель в центре Москвы рядом с Красной площадью.",
        stars=4,
        latitude=Decimal("55.755800"),
        longitude=Decimal("37.617300"),
    )
    nevsky = Hotel(
        name="Hotel Nevsky",
        city="Санкт-Петербург",
        address="Невский проспект 10",
        description="Пятизвёздочный отель на главной улице Санкт-Петербурга.",
        stars=5,
        latitude=Decimal("59.931100"),
        longitude=Decimal("30.360900"),
    )
    session.add_all([moscow, nevsky])
    session.flush()

    rooms = [
        Room(
            hotel_id=moscow.id,
            room_type_id=room_types[0].id,
            number="101",
            price=Decimal("4500.00"),
            capacity=2,
            description="Standard twin",
            status=RoomStatus.AVAILABLE,
        ),
        Room(
            hotel_id=moscow.id,
            room_type_id=room_types[1].id,
            number="201",
            price=Decimal("7200.00"),
            capacity=2,
            description="Deluxe with city view",
            status=RoomStatus.AVAILABLE,
        ),
        Room(
            hotel_id=nevsky.id,
            room_type_id=room_types[2].id,
            number="301",
            price=Decimal("9800.00"),
            capacity=3,
            description="Suite overlooking Nevsky",
            status=RoomStatus.AVAILABLE,
        ),
    ]
    session.add_all(rooms)
    session.flush()

    for hotel in (moscow, nevsky):
        hotel_dir = root / "hotels" / str(hotel.id)
        hotel_dir.mkdir(parents=True, exist_ok=True)
        filename = "seed-cover.png"
        file_path = hotel_dir / filename
        file_path.write_bytes(_SEED_PNG)
        relative_url = f"/media/hotels/{hotel.id}/{filename}"
        session.add(
            Image(
                entity_type=ImageEntityType.HOTEL,
                entity_id=hotel.id,
                url=relative_url,
                sort_order=0,
            )
        )

    session.add(
        Review(
            hotel_id=moscow.id,
            user_id=client.id,
            rating=5,
            comment="Отличный отель в центре города, всё понравилось.",
        )
    )

    session.commit()
    return True


def main() -> None:
    with SessionLocal() as session:
        ran = run_seed(session)
    if ran:
        print("Seed data inserted.")
    else:
        print("Seed skipped: admin user already exists.")


if __name__ == "__main__":
    main()
