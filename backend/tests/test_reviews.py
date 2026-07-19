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

REVIEW_PAYLOAD = {
    "rating": 5,
    "comment": "Отличный отель, чисто и тихо.",
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
def other_client_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        user = _create_user(session, email="other@example.com", role=UserRole.CLIENT)
        return _auth_headers(user)


@pytest.fixture
def hotel_id(client: TestClient, admin_headers: dict[str, str]) -> int:
    response = client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=admin_headers)
    assert response.status_code == 201
    return response.json()["id"]


def test_create_list_update_delete_review_and_avg_rating(
    client: TestClient,
    client_headers: dict[str, str],
    hotel_id: int,
) -> None:
    created = client.post(
        f"/api/v1/hotels/{hotel_id}/reviews",
        json=REVIEW_PAYLOAD,
        headers=client_headers,
    )
    assert created.status_code == 201
    body = created.json()
    assert body["rating"] == 5
    assert body["user_name"] == "Test User"

    listed = client.get(f"/api/v1/hotels/{hotel_id}/reviews")
    assert listed.status_code == 200
    assert listed.json()["total"] == 1

    hotel = client.get(f"/api/v1/hotels/{hotel_id}")
    assert hotel.status_code == 200
    assert hotel.json()["avg_rating"] == 5.0
    assert hotel.json()["reviews_count"] == 1

    updated = client.patch(
        f"/api/v1/reviews/{body['id']}",
        json={"rating": 4, "comment": "Хорошо, но шумно утром."},
        headers=client_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["rating"] == 4

    hotel = client.get(f"/api/v1/hotels/{hotel_id}")
    assert hotel.json()["avg_rating"] == 4.0

    deleted = client.delete(f"/api/v1/reviews/{body['id']}", headers=client_headers)
    assert deleted.status_code == 204

    hotel = client.get(f"/api/v1/hotels/{hotel_id}")
    assert hotel.json()["avg_rating"] is None
    assert hotel.json()["reviews_count"] == 0


def test_duplicate_review_returns_409(
    client: TestClient,
    client_headers: dict[str, str],
    hotel_id: int,
) -> None:
    first = client.post(
        f"/api/v1/hotels/{hotel_id}/reviews",
        json=REVIEW_PAYLOAD,
        headers=client_headers,
    )
    assert first.status_code == 201

    second = client.post(
        f"/api/v1/hotels/{hotel_id}/reviews",
        json=REVIEW_PAYLOAD,
        headers=client_headers,
    )
    assert second.status_code == 409


def test_non_owner_cannot_patch_review(
    client: TestClient,
    client_headers: dict[str, str],
    other_client_headers: dict[str, str],
    hotel_id: int,
) -> None:
    created = client.post(
        f"/api/v1/hotels/{hotel_id}/reviews",
        json=REVIEW_PAYLOAD,
        headers=client_headers,
    )
    review_id = created.json()["id"]

    forbidden = client.patch(
        f"/api/v1/reviews/{review_id}",
        json={"rating": 3},
        headers=other_client_headers,
    )
    assert forbidden.status_code == 403


def test_admin_can_delete_any_review(
    client: TestClient,
    admin_headers: dict[str, str],
    client_headers: dict[str, str],
    hotel_id: int,
) -> None:
    created = client.post(
        f"/api/v1/hotels/{hotel_id}/reviews",
        json=REVIEW_PAYLOAD,
        headers=client_headers,
    )
    deleted = client.delete(
        f"/api/v1/reviews/{created.json()['id']}",
        headers=admin_headers,
    )
    assert deleted.status_code == 204


def test_short_comment_returns_422(
    client: TestClient,
    client_headers: dict[str, str],
    hotel_id: int,
) -> None:
    response = client.post(
        f"/api/v1/hotels/{hotel_id}/reviews",
        json={"rating": 5, "comment": "short"},
        headers=client_headers,
    )
    assert response.status_code == 422
