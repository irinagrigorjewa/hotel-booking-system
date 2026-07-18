from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from httpx import Response
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


@pytest.fixture
def client_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        client_user = User(
            name="Client User",
            email="client@example.com",
            password_hash="hash",
            role=UserRole.CLIENT,
        )
        session.add(client_user)
        session.commit()
        session.refresh(client_user)
        token = create_access_token(user_id=client_user.id, role=client_user.role)
        return {"Authorization": f"Bearer {token}"}


@pytest.mark.parametrize(
    "mutation",
    [
        lambda client: client.post("/api/v1/hotels", json=HOTEL_PAYLOAD),
        lambda client: client.put("/api/v1/hotels/1", json=HOTEL_PAYLOAD),
        lambda client: client.delete("/api/v1/hotels/1"),
    ],
)
def test_hotel_mutations_require_authentication(
    client: TestClient,
    mutation: Callable[[TestClient], Response],
) -> None:
    response = mutation(client)

    assert response.status_code == 401


@pytest.mark.parametrize(
    "mutation",
    [
        lambda client, headers: client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=headers),
        lambda client, headers: client.put("/api/v1/hotels/1", json=HOTEL_PAYLOAD, headers=headers),
        lambda client, headers: client.delete("/api/v1/hotels/1", headers=headers),
    ],
)
def test_hotel_mutations_reject_client_users(
    client: TestClient,
    client_headers: dict[str, str],
    mutation: Callable[[TestClient, dict[str, str]], Response],
) -> None:
    response = mutation(client, client_headers)

    assert response.status_code == 403
