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


@pytest.fixture
def client_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        user = _create_user(session, email="client@example.com", role=UserRole.CLIENT)
        return _auth_headers(user)


@pytest.fixture
def hotel_id(client: TestClient, admin_headers: dict[str, str]) -> int:
    response = client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=admin_headers)
    assert response.status_code == 201
    return response.json()["id"]


def test_favorites_add_list_delete_and_is_favorite_flag(
    client: TestClient,
    client_headers: dict[str, str],
    hotel_id: int,
) -> None:
    anonymous = client.get(f"/api/v1/hotels/{hotel_id}")
    assert anonymous.status_code == 200
    assert anonymous.json()["is_favorite"] is None

    created = client.post(f"/api/v1/favorites/{hotel_id}", headers=client_headers)
    assert created.status_code == 201
    assert created.json()["hotel_id"] == hotel_id

    duplicate = client.post(f"/api/v1/favorites/{hotel_id}", headers=client_headers)
    assert duplicate.status_code == 409

    listed = client.get("/api/v1/favorites", headers=client_headers)
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["is_favorite"] is True

    detail = client.get(f"/api/v1/hotels/{hotel_id}", headers=client_headers)
    assert detail.json()["is_favorite"] is True

    hotels_list = client.get("/api/v1/hotels", headers=client_headers)
    assert hotels_list.json()["items"][0]["is_favorite"] is True

    deleted = client.delete(f"/api/v1/favorites/{hotel_id}", headers=client_headers)
    assert deleted.status_code == 204

    missing = client.delete(f"/api/v1/favorites/{hotel_id}", headers=client_headers)
    assert missing.status_code == 404

    detail = client.get(f"/api/v1/hotels/{hotel_id}", headers=client_headers)
    assert detail.json()["is_favorite"] is False


def test_favorite_unknown_hotel_returns_404(
    client: TestClient,
    client_headers: dict[str, str],
) -> None:
    response = client.post("/api/v1/favorites/9999", headers=client_headers)
    assert response.status_code == 404
