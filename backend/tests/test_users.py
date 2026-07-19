from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import create_access_token, hash_password
from app.models.enums import UserRole
from app.models.user import User


def _create_user(
    session: Session,
    *,
    email: str,
    role: UserRole = UserRole.CLIENT,
    name: str = "User",
) -> User:
    user = User(
        name=name,
        email=email,
        password_hash=hash_password("Secret123!"),
        phone=None,
        role=role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def _auth_headers(user: User) -> dict[str, str]:
    token = create_access_token(user_id=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


def test_admin_can_list_users(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        admin = _create_user(session, email="admin@example.com", role=UserRole.ADMIN)
        _create_user(session, email="client@example.com", name="Client")
        headers = _auth_headers(admin)

    response = client.get("/api/v1/users", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2


def test_client_cannot_list_users(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        client_user = _create_user(session, email="client@example.com")
        headers = _auth_headers(client_user)

    response = client.get("/api/v1/users", headers=headers)

    assert response.status_code == 403


def test_patch_me_updates_name_and_phone(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        user = _create_user(session, email="me@example.com", name="Old")
        headers = _auth_headers(user)

    response = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"name": "New Name", "phone": "+79001112233"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
    assert response.json()["phone"] == "+79001112233"


def test_patch_me_rejects_role_field(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        user = _create_user(session, email="me@example.com")
        headers = _auth_headers(user)

    response = client.patch(
        "/api/v1/users/me",
        headers=headers,
        json={"name": "New", "role": "ADMIN"},
    )

    assert response.status_code == 422


def test_owner_can_get_own_profile(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        user = _create_user(session, email="me@example.com")
        headers = _auth_headers(user)
        user_id = user.id

    response = client.get(f"/api/v1/users/{user_id}", headers=headers)

    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


def test_client_cannot_get_other_profile(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        owner = _create_user(session, email="owner@example.com")
        other = _create_user(session, email="other@example.com")
        headers = _auth_headers(other)
        owner_id = owner.id

    response = client.get(f"/api/v1/users/{owner_id}", headers=headers)

    assert response.status_code == 403


def test_admin_can_change_role(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        admin = _create_user(session, email="admin@example.com", role=UserRole.ADMIN)
        target = _create_user(session, email="client@example.com")
        headers = _auth_headers(admin)
        target_id = target.id

    response = client.patch(
        f"/api/v1/users/{target_id}",
        headers=headers,
        json={"role": "ADMIN"},
    )

    assert response.status_code == 200
    assert response.json()["role"] == "ADMIN"


def test_cannot_demote_last_admin(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        admin = _create_user(session, email="admin@example.com", role=UserRole.ADMIN)
        headers = _auth_headers(admin)
        admin_id = admin.id

    response = client.patch(
        f"/api/v1/users/{admin_id}",
        headers=headers,
        json={"role": "CLIENT"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Cannot demote the last admin"


def test_admin_can_demote_when_another_admin_exists(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        admin = _create_user(session, email="admin@example.com", role=UserRole.ADMIN)
        other_admin = _create_user(
            session,
            email="admin2@example.com",
            role=UserRole.ADMIN,
            name="Admin Two",
        )
        headers = _auth_headers(admin)
        other_id = other_admin.id

    response = client.patch(
        f"/api/v1/users/{other_id}",
        headers=headers,
        json={"role": "CLIENT"},
    )

    assert response.status_code == 200
    assert response.json()["role"] == "CLIENT"


def test_client_cannot_change_own_role(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        user = _create_user(session, email="client@example.com")
        headers = _auth_headers(user)
        user_id = user.id

    response = client.patch(
        f"/api/v1/users/{user_id}",
        headers=headers,
        json={"role": "ADMIN"},
    )

    assert response.status_code == 403
