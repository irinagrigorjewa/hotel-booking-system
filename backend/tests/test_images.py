from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.security import create_access_token
from app.database.base import Base
from app.models.enums import UserRole
from app.models.image import Image
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


def test_image_model_registers_schema() -> None:
    images = Base.metadata.tables["images"]

    assert Image.__table__ is images
    assert set(images.c.keys()) == {
        "id",
        "entity_type",
        "entity_id",
        "url",
        "sort_order",
        "created_at",
    }
    assert {index.name for index in images.indexes} == {
        "ix_images_entity_type_entity_id",
    }


def _create_admin(session: Session) -> dict[str, str]:
    admin = User(
        name="Admin",
        email="admin-img@example.com",
        password_hash="hash",
        role=UserRole.ADMIN,
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    token = create_access_token(user_id=admin.id, role=admin.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_session_factory: sessionmaker[Session]) -> dict[str, str]:
    with test_session_factory() as session:
        return _create_admin(session)


@pytest.fixture
def hotel_id(client: TestClient, admin_headers: dict[str, str]) -> int:
    response = client.post("/api/v1/hotels", json=HOTEL_PAYLOAD, headers=admin_headers)
    assert response.status_code == 201
    return response.json()["id"]


def test_admin_can_upload_patch_and_delete_hotel_image(
    client: TestClient,
    admin_headers: dict[str, str],
    hotel_id: int,
    tmp_path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    upload_dir = tmp_path / "uploads"
    monkeypatch.setattr(settings, "upload_dir", upload_dir)

    upload = client.post(
        f"/api/v1/hotels/{hotel_id}/images",
        headers=admin_headers,
        files={"file": ("photo.png", BytesIO(b"\x89PNG\r\n\x1a\nfake"), "image/png")},
        data={"sort_order": "1"},
    )

    assert upload.status_code == 201
    body = upload.json()
    assert body["entity_type"] == "HOTEL"
    assert body["entity_id"] == hotel_id
    assert body["url"].startswith("/media/hotels/")
    assert (upload_dir / body["url"].removeprefix("/media/")).exists()

    detail = client.get(f"/api/v1/hotels/{hotel_id}")
    assert detail.status_code == 200
    assert detail.json()["images"][0]["id"] == body["id"]
    assert detail.json()["cover_image"] == body["url"]

    patched = client.patch(
        f"/api/v1/images/{body['id']}",
        headers=admin_headers,
        json={"sort_order": 5},
    )
    assert patched.status_code == 200
    assert patched.json()["sort_order"] == 5

    deleted = client.delete(f"/api/v1/images/{body['id']}", headers=admin_headers)
    assert deleted.status_code == 204
    assert not (upload_dir / body["url"].removeprefix("/media/")).exists()


def test_unsupported_media_type_returns_415(
    client: TestClient,
    admin_headers: dict[str, str],
    hotel_id: int,
) -> None:
    response = client.post(
        f"/api/v1/hotels/{hotel_id}/images",
        headers=admin_headers,
        files={"file": ("note.txt", BytesIO(b"hello"), "text/plain")},
    )

    assert response.status_code == 415


def test_oversized_file_returns_413(
    client: TestClient,
    admin_headers: dict[str, str],
    hotel_id: int,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(settings, "max_upload_size_mb", 0)
    response = client.post(
        f"/api/v1/hotels/{hotel_id}/images",
        headers=admin_headers,
        files={"file": ("photo.png", BytesIO(b"12345"), "image/png")},
    )

    assert response.status_code == 413
