from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import create_access_token
from app.models.enums import RoomStatus, UserRole
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


def _today() -> date:
    return datetime.now(UTC).date()


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
def client_user(test_session_factory: sessionmaker[Session]) -> tuple[User, dict[str, str]]:
    with test_session_factory() as session:
        user = _create_user(session, email="client@example.com", role=UserRole.CLIENT)
        return user, _auth_headers(user)


@pytest.fixture
def other_client_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        user = _create_user(session, email="other@example.com", role=UserRole.CLIENT)
        return _auth_headers(user)


@pytest.fixture
def room_id(
    client: TestClient,
    admin_headers: dict[str, str],
) -> int:
    hotel = client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=admin_headers)
    room_type = client.post(
        "/api/v1/room-types",
        json={"name": "Deluxe"},
        headers=admin_headers,
    )
    assert hotel.status_code == 201
    assert room_type.status_code == 201
    room = client.post(
        "/api/v1/rooms",
        json={
            "hotel_id": hotel.json()["id"],
            "room_type_id": room_type.json()["id"],
            "number": "301",
            "price": "5500.00",
            "capacity": 2,
            "description": "City view",
            "status": "AVAILABLE",
        },
        headers=admin_headers,
    )
    assert room.status_code == 201
    return room.json()["id"]


def _booking_payload(room_id: int, *, offset_days: int = 10, nights: int = 5) -> dict[str, object]:
    check_in = _today() + timedelta(days=offset_days)
    check_out = check_in + timedelta(days=nights)
    return {
        "room_id": room_id,
        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),
    }


def test_client_can_create_list_get_and_cancel_booking(
    client: TestClient,
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, headers = client_user
    payload = _booking_payload(room_id)

    created = client.post("/api/v1/bookings", json=payload, headers=headers)
    assert created.status_code == 201
    body = created.json()
    assert body["status"] == "CONFIRMED"
    assert body["nights"] == 5
    assert Decimal(body["total_price"]) == Decimal("27500.00")
    assert body["room"]["number"] == "301"
    assert body["user"] is None

    listed = client.get("/api/v1/bookings", headers=headers)
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["id"] == body["id"]

    detail = client.get(f"/api/v1/bookings/{body['id']}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["id"] == body["id"]

    cancelled = client.patch(f"/api/v1/bookings/{body['id']}/cancel", headers=headers)
    assert cancelled.status_code == 200
    assert cancelled.json()["status"] == "CANCELLED"


def test_booking_overlap_returns_409(
    client: TestClient,
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, headers = client_user
    first = client.post("/api/v1/bookings", json=_booking_payload(room_id), headers=headers)
    assert first.status_code == 201

    overlap = client.post(
        "/api/v1/bookings",
        json=_booking_payload(room_id, offset_days=12, nights=3),
        headers=headers,
    )
    assert overlap.status_code == 409
    assert overlap.json() == {"detail": "Booking dates overlap with an existing booking"}


def test_adjacent_dates_are_allowed(
    client: TestClient,
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, headers = client_user
    first = client.post(
        "/api/v1/bookings",
        json=_booking_payload(room_id, offset_days=10, nights=5),
        headers=headers,
    )
    assert first.status_code == 201

    adjacent = client.post(
        "/api/v1/bookings",
        json=_booking_payload(room_id, offset_days=15, nights=2),
        headers=headers,
    )
    assert adjacent.status_code == 201


def test_cancelled_booking_does_not_block_overlap(
    client: TestClient,
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, headers = client_user
    first = client.post("/api/v1/bookings", json=_booking_payload(room_id), headers=headers)
    assert first.status_code == 201
    cancel = client.patch(f"/api/v1/bookings/{first.json()['id']}/cancel", headers=headers)
    assert cancel.status_code == 200

    second = client.post("/api/v1/bookings", json=_booking_payload(room_id), headers=headers)
    assert second.status_code == 201


def test_invalid_nights_and_past_check_in_return_400(
    client: TestClient,
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, headers = client_user

    too_long = client.post(
        "/api/v1/bookings",
        json=_booking_payload(room_id, nights=31),
        headers=headers,
    )
    assert too_long.status_code == 400

    past = client.post(
        "/api/v1/bookings",
        json={
            "room_id": room_id,
            "check_in": (_today() - timedelta(days=1)).isoformat(),
            "check_out": (_today() + timedelta(days=2)).isoformat(),
        },
        headers=headers,
    )
    assert past.status_code == 400


def test_client_cannot_view_foreign_booking(
    client: TestClient,
    client_user: tuple[User, dict[str, str]],
    other_client_headers: dict[str, str],
    room_id: int,
) -> None:
    _, headers = client_user
    created = client.post("/api/v1/bookings", json=_booking_payload(room_id), headers=headers)
    assert created.status_code == 201

    foreign = client.get(
        f"/api/v1/bookings/{created.json()['id']}",
        headers=other_client_headers,
    )
    assert foreign.status_code == 403

    foreign_list = client.get("/api/v1/bookings", headers=other_client_headers)
    assert foreign_list.status_code == 200
    assert foreign_list.json()["total"] == 0


def test_admin_can_list_all_and_patch_status(
    client: TestClient,
    admin_headers: dict[str, str],
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, client_headers = client_user
    created = client.post(
        "/api/v1/bookings",
        json=_booking_payload(room_id),
        headers=client_headers,
    )
    assert created.status_code == 201
    booking_id = created.json()["id"]

    listed = client.get("/api/v1/bookings", headers=admin_headers)
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["user"]["email"] == "client@example.com"

    completed = client.patch(
        f"/api/v1/bookings/{booking_id}",
        json={"status": "COMPLETED"},
        headers=admin_headers,
    )
    assert completed.status_code == 200
    assert completed.json()["status"] == "COMPLETED"

    invalid = client.patch(
        f"/api/v1/bookings/{booking_id}",
        json={"status": "CONFIRMED"},
        headers=admin_headers,
    )
    assert invalid.status_code == 400


def test_cannot_cancel_completed_booking(
    client: TestClient,
    admin_headers: dict[str, str],
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, client_headers = client_user
    created = client.post(
        "/api/v1/bookings",
        json=_booking_payload(room_id),
        headers=client_headers,
    )
    booking_id = created.json()["id"]
    client.patch(
        f"/api/v1/bookings/{booking_id}",
        json={"status": "COMPLETED"},
        headers=admin_headers,
    )

    cancel = client.patch(f"/api/v1/bookings/{booking_id}/cancel", headers=client_headers)
    assert cancel.status_code == 400


def test_maintenance_room_returns_400(
    client: TestClient,
    admin_headers: dict[str, str],
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    room = client.get(f"/api/v1/rooms/{room_id}").json()
    updated = client.put(
        f"/api/v1/rooms/{room_id}",
        json={
            "hotel_id": room["hotel"]["id"],
            "room_type_id": room["room_type"]["id"],
            "number": "301",
            "price": "5500.00",
            "capacity": 2,
            "description": "City view",
            "status": RoomStatus.MAINTENANCE.value,
        },
        headers=admin_headers,
    )
    assert updated.status_code == 200

    _, headers = client_user
    response = client.post(
        "/api/v1/bookings",
        json=_booking_payload(room_id),
        headers=headers,
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Room is not available"}


def test_hotel_delete_with_active_booking_returns_409(
    client: TestClient,
    admin_headers: dict[str, str],
    client_user: tuple[User, dict[str, str]],
    room_id: int,
) -> None:
    _, headers = client_user
    created = client.post("/api/v1/bookings", json=_booking_payload(room_id), headers=headers)
    assert created.status_code == 201
    hotel_id = client.get(f"/api/v1/rooms/{room_id}").json()["hotel"]["id"]

    deleted = client.delete(f"/api/v1/hotels/{hotel_id}", headers=admin_headers)
    assert deleted.status_code == 409
    assert deleted.json() == {"detail": "Cannot delete: active bookings exist"}
