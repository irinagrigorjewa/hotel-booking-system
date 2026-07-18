import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import create_access_token
from app.models.enums import UserRole
from app.models.room_type import RoomType
from app.models.user import User


def _create_user(session: Session, *, email: str, role: UserRole) -> User:
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


@pytest.fixture
def admin_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        admin = _create_user(session, email="admin@example.com", role=UserRole.ADMIN)
        token = create_access_token(user_id=admin.id, role=admin.role)
        return {"Authorization": f"Bearer {token}"}


def test_public_list_returns_paginated_room_types(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        session.add_all([RoomType(name="Standard"), RoomType(name="Suite")])
        session.commit()

    response = client.get("/api/v1/room-types", params={"page": 1, "size": 1})

    assert response.status_code == 200
    assert response.json() == {
        "items": [{"id": 1, "name": "Standard"}],
        "total": 2,
        "page": 1,
        "size": 1,
    }


def test_public_list_returns_empty_page(client: TestClient) -> None:
    response = client.get("/api/v1/room-types")

    assert response.status_code == 200
    assert response.json() == {"items": [], "total": 0, "page": 1, "size": 20}


def test_admin_can_create_update_and_delete_room_type(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    created_response = client.post(
        "/api/v1/room-types",
        json={"name": "Standard"},
        headers=admin_headers,
    )

    assert created_response.status_code == 201
    assert created_response.json()["name"] == "Standard"
    room_type_id = created_response.json()["id"]

    updated_response = client.put(
        f"/api/v1/room-types/{room_type_id}",
        json={"name": "Deluxe"},
        headers=admin_headers,
    )

    assert updated_response.status_code == 200
    assert updated_response.json() == {"id": room_type_id, "name": "Deluxe"}

    deleted_response = client.delete(f"/api/v1/room-types/{room_type_id}", headers=admin_headers)

    assert deleted_response.status_code == 204


def test_create_or_update_duplicate_name_returns_conflict(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    first_response = client.post(
        "/api/v1/room-types",
        json={"name": "Standard"},
        headers=admin_headers,
    )
    second_response = client.post(
        "/api/v1/room-types",
        json={"name": "Standard"},
        headers=admin_headers,
    )
    other_response = client.post(
        "/api/v1/room-types",
        json={"name": "Suite"},
        headers=admin_headers,
    )
    update_response = client.put(
        f"/api/v1/room-types/{other_response.json()['id']}",
        json={"name": "Standard"},
        headers=admin_headers,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json() == {"detail": "Room type already exists"}
    assert update_response.status_code == 409
    assert update_response.json() == {"detail": "Room type already exists"}


def test_client_cannot_manage_room_types(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        user = _create_user(session, email="client@example.com", role=UserRole.CLIENT)
        token = create_access_token(user_id=user.id, role=user.role)
        headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/v1/room-types", json={"name": "Standard"}, headers=headers)

    assert response.status_code == 403
    assert response.json() == {"detail": "Forbidden"}
