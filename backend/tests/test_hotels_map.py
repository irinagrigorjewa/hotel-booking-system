from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import create_access_token
from app.models.enums import UserRole
from app.models.user import User

HOTEL_PAYLOAD = {
    "name": "Hotel Moscow",
    "city": "Moscow",
    "address": "Tverskaya 1",
    "description": "Central hotel",
    "stars": 4,
    "latitude": "55.7558",
    "longitude": "37.6173",
}


def _create_user(session: Session, *, email: str, role: UserRole) -> User:
    user = User(name="Test User", email=email, password_hash="hash", role=role)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def _auth_headers(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user_id=user.id, role=user.role)}"}


@pytest.fixture
def admin_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        admin = _create_user(session, email="admin@example.com", role=UserRole.ADMIN)
        return _auth_headers(admin)


def test_hotels_map_returns_items_with_optional_city_filter(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    moscow = client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=admin_headers)
    sochi = client.post(
        "/api/v1/hotels",
        json={**HOTEL_PAYLOAD, "name": "Sochi Resort", "city": "Sochi", "latitude": "43.6"},
        headers=admin_headers,
    )
    assert moscow.status_code == 201
    assert sochi.status_code == 201

    room_type = client.post(
        "/api/v1/room-types",
        json={"name": "Standard"},
        headers=admin_headers,
    )
    assert room_type.status_code == 201
    room = client.post(
        "/api/v1/rooms",
        json={
            "hotel_id": moscow.json()["id"],
            "room_type_id": room_type.json()["id"],
            "number": "101",
            "price": "3500.00",
            "capacity": 2,
            "status": "AVAILABLE",
        },
        headers=admin_headers,
    )
    assert room.status_code == 201

    all_map = client.get("/api/v1/hotels/map")
    assert all_map.status_code == 200
    assert len(all_map.json()["items"]) == 2

    filtered = client.get("/api/v1/hotels/map", params={"city": "Moscow"})
    assert filtered.status_code == 200
    items = filtered.json()["items"]
    assert len(items) == 1
    assert items[0]["name"] == "Hotel Moscow"
    assert Decimal(items[0]["latitude"]) == Decimal("55.7558")
    assert Decimal(items[0]["longitude"]) == Decimal("37.6173")
    assert Decimal(items[0]["min_price"]) == Decimal("3500.00")
    assert items[0]["avg_rating"] is None

    partial = client.get("/api/v1/hotels/map", params={"city": "mos"})
    assert partial.status_code == 200
    assert len(partial.json()["items"]) == 1
    assert partial.json()["items"][0]["name"] == "Hotel Moscow"


def test_hotels_map_does_not_collide_with_hotel_id_route(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    response = client.get("/api/v1/hotels/map")
    assert response.status_code == 200
    assert "items" in response.json()
