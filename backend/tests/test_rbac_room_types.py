from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from httpx import Response
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import create_access_token
from app.models.enums import UserRole
from app.models.user import User


@pytest.fixture
def client_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        client_user = User(
            name="Client User",
            email="client-rt@example.com",
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
        lambda client, headers: client.post(
            "/api/v1/room-types",
            json={"name": "Standard"},
            headers=headers,
        ),
        lambda client, headers: client.put(
            "/api/v1/room-types/1",
            json={"name": "Suite"},
            headers=headers,
        ),
        lambda client, headers: client.delete(
            "/api/v1/room-types/1",
            headers=headers,
        ),
    ],
)
def test_client_cannot_mutate_room_types(
    client: TestClient,
    client_headers: dict[str, str],
    mutation: Callable[[TestClient, dict[str, str]], Response],
) -> None:
    response = mutation(client, client_headers)

    assert response.status_code == 403
    assert response.json() == {"detail": "Forbidden"}
