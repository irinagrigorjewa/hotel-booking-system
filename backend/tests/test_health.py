from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_missing_media_returns_non_server_error() -> None:
    response = client.get("/media/missing-image.jpg")

    assert response.status_code == 404
