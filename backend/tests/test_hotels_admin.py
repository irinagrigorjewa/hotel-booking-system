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


def create_user(
    session: Session,
    *,
    email: str,
    role: UserRole,
) -> User:
    user = User(
        name="Test User",
        email=email,
        password_hash="hash",
        role=role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def auth_headers(user: User) -> dict[str, str]:
    token = create_access_token(user_id=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        admin = create_user(session, email="admin@example.com", role=UserRole.ADMIN)
        return auth_headers(admin)


def test_admin_can_create_update_and_delete_hotel(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created_response = client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=admin_headers)

    assert created_response.status_code == 201
    created_hotel = created_response.json()
    assert created_hotel["name"] == HOTEL_PAYLOAD["name"]
    assert created_hotel["images"] == []

    updated_payload = {**HOTEL_PAYLOAD, "name": "Updated Hotel", "stars": 5}
    updated_response = client.put(
        f"/api/v1/hotels/{created_hotel['id']}",
        json=updated_payload,
        headers=admin_headers,
    )

    assert updated_response.status_code == 200
    assert updated_response.json()["name"] == "Updated Hotel"
    assert updated_response.json()["stars"] == 5

    deleted_response = client.delete(
        f"/api/v1/hotels/{created_hotel['id']}",
        headers=admin_headers,
    )

    assert deleted_response.status_code == 204


@pytest.mark.parametrize(
    ("payload_field", "invalid_value"),
    [
        ("latitude", "90.000001"),
        ("longitude", "-180.000001"),
        ("stars", 6),
    ],
)
def test_create_rejects_invalid_coordinates_and_stars(
    client: TestClient,
    admin_headers: dict[str, str],
    payload_field: str,
    invalid_value: str | int,
) -> None:
    response = client.post(
        "/api/v1/hotels",
        json={**HOTEL_PAYLOAD, payload_field: invalid_value},
        headers=admin_headers,
    )

    assert response.status_code == 422


def test_update_and_delete_return_404_for_missing_hotel(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    update_response = client.put("/api/v1/hotels/999", json=HOTEL_PAYLOAD, headers=admin_headers)
    delete_response = client.delete("/api/v1/hotels/999", headers=admin_headers)

    assert update_response.status_code == 404
    assert delete_response.status_code == 404
