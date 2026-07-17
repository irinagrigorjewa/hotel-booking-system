from collections.abc import Generator
from contextlib import contextmanager

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.database.base import Base
from app.database.session import get_session
from app.main import app


@contextmanager
def create_client() -> Generator[TestClient, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    previous_secret_key = settings.secret_key
    settings.secret_key = "test-secret-key-with-at-least-32-characters"
    Base.metadata.create_all(engine)

    def get_test_session() -> Generator[Session, None, None]:
        with test_session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = get_test_session
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    settings.secret_key = previous_secret_key


def test_register_creates_client_and_returns_token_pair() -> None:
    with create_client() as client:
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
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]
    assert response.json()["refresh_token"]


def test_register_rejects_duplicate_email() -> None:
    registration_data = {
        "name": "Ivan Ivanov",
        "email": "ivan@example.com",
        "password": "Secret123!",
    }
    with create_client() as client:
        client.post("/api/v1/auth/register", json=registration_data)
        response = client.post("/api/v1/auth/register", json=registration_data)

    assert response.status_code == 409
    assert response.json() == {"detail": "Email already registered"}


def test_login_returns_token_pair_for_valid_credentials() -> None:
    with create_client() as client:
        client.post(
            "/api/v1/auth/register",
            json={
                "name": "Ivan Ivanov",
                "email": "ivan@example.com",
                "password": "Secret123!",
            },
        )
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "ivan@example.com", "password": "Secret123!"},
        )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]
    assert response.json()["refresh_token"]


def test_login_returns_generic_error_for_invalid_credentials() -> None:
    with create_client() as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "missing@example.com", "password": "Secret123!"},
        )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials"}


def test_refresh_revokes_previous_token() -> None:
    with create_client() as client:
        registration_response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Ivan Ivanov",
                "email": "ivan@example.com",
                "password": "Secret123!",
            },
        )

        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": registration_response.json()["refresh_token"]},
        )

    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["refresh_token"]


def test_refresh_rejects_previously_rotated_token() -> None:
    with create_client() as client:
        registration_response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Ivan Ivanov",
                "email": "ivan@example.com",
                "password": "Secret123!",
            },
        )
        refresh_token = registration_response.json()["refresh_token"]

        client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid refresh token"}


def test_logout_revokes_current_users_refresh_token() -> None:
    with create_client() as client:
        registration_response = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Ivan Ivanov",
                "email": "ivan@example.com",
                "password": "Secret123!",
            },
        )
        token_pair = registration_response.json()

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


def test_refresh_rejects_expired_token() -> None:
    previous_refresh_ttl = settings.refresh_token_expire_days
    settings.refresh_token_expire_days = -1
    try:
        with create_client() as client:
            registration_response = client.post(
                "/api/v1/auth/register",
                json={
                    "name": "Ivan Ivanov",
                    "email": "ivan@example.com",
                    "password": "Secret123!",
                },
            )
            response = client.post(
                "/api/v1/auth/refresh",
                json={"refresh_token": registration_response.json()["refresh_token"]},
            )
    finally:
        settings.refresh_token_expire_days = previous_refresh_ttl

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid refresh token"}
