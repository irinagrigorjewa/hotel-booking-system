from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import hash_refresh_token
from app.core.deps import require_admin
from app.models.enums import UserRole
from app.models.refresh_token import RefreshToken
from app.models.user import User


def register_user(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Ivan Ivanov",
            "email": "ivan@example.com",
            "password": "Secret123!",
            "phone": "+79001234567",
        },
    )

    assert response.status_code == 201
    return response.json()


def test_register_creates_client_and_returns_token_pair(client: TestClient) -> None:
    token_pair = register_user(client)
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_pair['access_token']}"},
    )

    assert response.status_code == 200
    assert token_pair["token_type"] == "bearer"
    assert token_pair["access_token"]
    assert token_pair["refresh_token"]
    assert response.json()["role"] == UserRole.CLIENT


def test_register_rejects_duplicate_email(client: TestClient) -> None:
    registration_data = {
        "name": "Ivan Ivanov",
        "email": "ivan@example.com",
        "password": "Secret123!",
    }
    client.post("/api/v1/auth/register", json=registration_data)
    response = client.post("/api/v1/auth/register", json=registration_data)

    assert response.status_code == 409
    assert response.json() == {"detail": "Email already registered"}


def test_login_returns_token_pair_for_valid_credentials(client: TestClient) -> None:
    register_user(client)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ivan@example.com", "password": "Secret123!"},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]
    assert response.json()["refresh_token"]


def test_login_rejects_unknown_email(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "Secret123!"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials"}


def test_login_rejects_incorrect_password(client: TestClient) -> None:
    register_user(client)
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ivan@example.com", "password": "Incorrect123!"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials"}


def test_refresh_returns_new_token_pair_and_revokes_previous_token(client: TestClient) -> None:
    old_token_pair = register_user(client)
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_token_pair["refresh_token"]},
    )

    new_token_pair = response.json()
    assert response.status_code == 200
    assert new_token_pair["access_token"] != old_token_pair["access_token"]
    assert new_token_pair["refresh_token"] != old_token_pair["refresh_token"]
    assert client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_token_pair["refresh_token"]},
    ).status_code == 401


def test_refresh_rejects_previously_rotated_token(client: TestClient) -> None:
    token_pair = register_user(client)
    client.post("/api/v1/auth/refresh", json={"refresh_token": token_pair["refresh_token"]})
    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_pair["refresh_token"]},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid refresh token"}


def test_logout_revokes_current_users_refresh_token(client: TestClient) -> None:
    token_pair = register_user(client)
    logout_response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token_pair['access_token']}"},
        json={"refresh_token": token_pair["refresh_token"]},
    )
    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_pair["refresh_token"]},
    )

    assert logout_response.status_code == 204
    assert refresh_response.status_code == 401
    assert refresh_response.json() == {"detail": "Invalid refresh token"}


def test_refresh_rejects_expired_token(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    token_pair = register_user(client)
    with test_session_factory() as session:
        refresh_token = session.scalar(
            select(RefreshToken).where(
                RefreshToken.token_hash == hash_refresh_token(token_pair["refresh_token"])
            )
        )
        assert refresh_token is not None
        refresh_token.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        session.commit()

    response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_pair["refresh_token"]},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid refresh token"}


def test_auth_me_returns_current_users_safe_profile(client: TestClient) -> None:
    token_pair = register_user(client)
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token_pair['access_token']}"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Ivan Ivanov"
    assert response.json()["email"] == "ivan@example.com"
    assert response.json()["phone"] == "+79001234567"
    assert response.json()["role"] == UserRole.CLIENT
    assert "password_hash" not in response.json()


def test_auth_me_rejects_request_without_access_token(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_auth_me_rejects_invalid_access_token(client: TestClient) -> None:
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid token"}


def test_refresh_token_is_stored_as_hash(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    token_pair = register_user(client)
    with test_session_factory() as session:
        refresh_token = session.scalar(
            select(RefreshToken).where(
                RefreshToken.token_hash == hash_refresh_token(token_pair["refresh_token"])
            )
        )

    assert refresh_token is not None
    assert refresh_token.token_hash == hash_refresh_token(token_pair["refresh_token"])
    assert refresh_token.token_hash != token_pair["refresh_token"]


def test_require_admin_rejects_client_user() -> None:
    client_user = User(
        id=1,
        name="Ivan Ivanov",
        email="ivan@example.com",
        password_hash="hash",
        role=UserRole.CLIENT,
    )

    try:
        require_admin(client_user)
    except HTTPException as error:
        assert error.status_code == 403
        assert error.detail == "Forbidden"
    else:
        raise AssertionError("CLIENT user must not satisfy require_admin")
