from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.security import create_access_token
from app.models.booking import Booking
from app.models.enums import BookingStatus, RoomStatus, UserRole
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.room_type import RoomType
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
def seeded(
    test_session_factory: sessionmaker[Session],
    admin_headers: dict[str, str],
    client: TestClient,
) -> dict[str, int]:
    hotel_response = client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=admin_headers)
    room_type_response = client.post(
        "/api/v1/room-types",
        json={"name": "Deluxe"},
        headers=admin_headers,
    )
    assert hotel_response.status_code == 201
    assert room_type_response.status_code == 201
    return {
        "hotel_id": hotel_response.json()["id"],
        "room_type_id": room_type_response.json()["id"],
    }


def _room_payload(seeded: dict[str, int], **overrides: object) -> dict[str, object]:
    payload: dict[str, object] = {
        "hotel_id": seeded["hotel_id"],
        "room_type_id": seeded["room_type_id"],
        "number": "301",
        "price": "5500.00",
        "capacity": 2,
        "description": "City view",
        "status": "AVAILABLE",
    }
    payload.update(overrides)
    return payload


def test_admin_can_create_get_update_and_delete_room(
    client: TestClient,
    admin_headers: dict[str, str],
    seeded: dict[str, int],
) -> None:
    created = client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded),
        headers=admin_headers,
    )

    assert created.status_code == 201
    body = created.json()
    assert body["number"] == "301"
    assert body["hotel"]["city"] == "Moscow"
    assert body["room_type"]["name"] == "Deluxe"
    assert body["images"] == []

    detail = client.get(f"/api/v1/rooms/{body['id']}")
    assert detail.status_code == 200
    assert detail.json()["id"] == body["id"]

    updated = client.put(
        f"/api/v1/rooms/{body['id']}",
        json=_room_payload(seeded, number="302", capacity=3),
        headers=admin_headers,
    )
    assert updated.status_code == 200
    assert updated.json()["number"] == "302"
    assert updated.json()["capacity"] == 3

    deleted = client.delete(f"/api/v1/rooms/{body['id']}", headers=admin_headers)
    assert deleted.status_code == 204


def test_duplicate_room_number_returns_409(
    client: TestClient,
    admin_headers: dict[str, str],
    seeded: dict[str, int],
) -> None:
    first = client.post("/api/v1/rooms", json=_room_payload(seeded), headers=admin_headers)
    second = client.post("/api/v1/rooms", json=_room_payload(seeded), headers=admin_headers)

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json() == {"detail": "Room number already exists"}


def test_client_cannot_create_room(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
    seeded: dict[str, int],
) -> None:
    with test_session_factory() as session:
        user = _create_user(session, email="client@example.com", role=UserRole.CLIENT)
        headers = _auth_headers(user)

    response = client.post("/api/v1/rooms", json=_room_payload(seeded), headers=headers)

    assert response.status_code == 403


def test_list_filters_by_hotel_capacity_price_and_city(
    client: TestClient,
    admin_headers: dict[str, str],
    seeded: dict[str, int],
) -> None:
    client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded, number="101", capacity=2, price="4000.00"),
        headers=admin_headers,
    )
    client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded, number="201", capacity=4, price="8000.00"),
        headers=admin_headers,
    )

    filtered = client.get(
        "/api/v1/rooms",
        params={
            "hotel_id": seeded["hotel_id"],
            "city": "Moscow",
            "capacity": 3,
            "price_from": "5000",
            "price_to": "9000",
        },
    )

    assert filtered.status_code == 200
    payload = filtered.json()
    assert payload["total"] == 1
    assert payload["items"][0]["number"] == "201"

    partial = client.get(
        "/api/v1/rooms",
        params={"hotel_id": seeded["hotel_id"], "city": "mos"},
    )
    assert partial.status_code == 200
    assert partial.json()["total"] == 2


def test_list_rooms_city_filter_escapes_like_wildcards(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    percent_hotel = client.post(
        "/api/v1/hotels",
        json={**HOTEL_PAYLOAD, "name": "Percent City", "city": "100%"},
        headers=admin_headers,
    )
    other_hotel = client.post(
        "/api/v1/hotels",
        json={**HOTEL_PAYLOAD, "name": "Plain Hundred", "city": "100", "latitude": "55.76"},
        headers=admin_headers,
    )
    room_type = client.post(
        "/api/v1/room-types",
        json={"name": "Standard"},
        headers=admin_headers,
    )
    assert percent_hotel.status_code == 201
    assert other_hotel.status_code == 201
    assert room_type.status_code == 201

    room_type_id = room_type.json()["id"]
    for hotel_id, number in (
        (percent_hotel.json()["id"], "101"),
        (other_hotel.json()["id"], "201"),
    ):
        created = client.post(
            "/api/v1/rooms",
            json={
                "hotel_id": hotel_id,
                "room_type_id": room_type_id,
                "number": number,
                "price": "4000.00",
                "capacity": 2,
                "status": "AVAILABLE",
            },
            headers=admin_headers,
        )
        assert created.status_code == 201

    filtered = client.get("/api/v1/rooms", params={"city": "100%"})
    assert filtered.status_code == 200
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["hotel"]["city"] == "100%"


def test_date_filter_excludes_overlapping_and_maintenance(
    client: TestClient,
    admin_headers: dict[str, str],
    seeded: dict[str, int],
    test_session_factory: sessionmaker[Session],
) -> None:
    available = client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded, number="101"),
        headers=admin_headers,
    ).json()
    free = client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded, number="102"),
        headers=admin_headers,
    ).json()
    client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded, number="103", status="MAINTENANCE"),
        headers=admin_headers,
    )

    with test_session_factory() as session:
        user = _create_user(session, email="guest@example.com", role=UserRole.CLIENT)
        session.add(
            Booking(
                user_id=user.id,
                room_id=available["id"],
                check_in=date(2026, 7, 10),
                check_out=date(2026, 7, 15),
                total_price=Decimal("27500.00"),
                status=BookingStatus.CONFIRMED,
            )
        )
        session.commit()

    response = client.get(
        "/api/v1/rooms",
        params={
            "hotel_id": seeded["hotel_id"],
            "date_from": "2026-07-12",
            "date_to": "2026-07-14",
        },
    )

    assert response.status_code == 200
    numbers = [item["number"] for item in response.json()["items"]]
    assert numbers == ["102"]
    assert free["number"] in numbers


def test_invalid_date_range_returns_422(client: TestClient) -> None:
    response = client.get(
        "/api/v1/rooms",
        params={"date_from": "2026-07-15", "date_to": "2026-07-10"},
    )

    assert response.status_code == 422
    assert response.json() == {"detail": "Invalid date range"}


def test_delete_room_with_active_booking_returns_409(
    client: TestClient,
    admin_headers: dict[str, str],
    seeded: dict[str, int],
    test_session_factory: sessionmaker[Session],
) -> None:
    room = client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded),
        headers=admin_headers,
    ).json()

    with test_session_factory() as session:
        user = _create_user(session, email="booker@example.com", role=UserRole.CLIENT)
        session.add(
            Booking(
                user_id=user.id,
                room_id=room["id"],
                check_in=date(2026, 8, 1),
                check_out=date(2026, 8, 5),
                total_price=Decimal("22000.00"),
                status=BookingStatus.PENDING,
            )
        )
        session.commit()

    response = client.delete(f"/api/v1/rooms/{room['id']}", headers=admin_headers)

    assert response.status_code == 409
    assert response.json() == {"detail": "Room has active bookings"}


def test_delete_room_type_with_linked_rooms_returns_409(
    client: TestClient,
    admin_headers: dict[str, str],
    seeded: dict[str, int],
) -> None:
    created = client.post(
        "/api/v1/rooms",
        json=_room_payload(seeded),
        headers=admin_headers,
    )
    assert created.status_code == 201

    response = client.delete(
        f"/api/v1/room-types/{seeded['room_type_id']}",
        headers=admin_headers,
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Room type has linked rooms"}
