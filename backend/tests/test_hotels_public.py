from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.models.hotel import Hotel


def create_hotel(
    session: Session,
    *,
    name: str,
    city: str,
    stars: int,
) -> Hotel:
    hotel = Hotel(
        name=name,
        city=city,
        address=f"{name} address",
        description=f"{name} description",
        stars=stars,
        latitude=Decimal("55.755800"),
        longitude=Decimal("37.617300"),
    )
    session.add(hotel)
    session.commit()
    session.refresh(hotel)
    return hotel


def test_list_hotels_filters_sorts_and_paginates(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        create_hotel(session, name="Moscow Four", city="Moscow", stars=4)
        create_hotel(session, name="Moscow Five", city="Moscow", stars=5)
        create_hotel(session, name="Kazan Five", city="Kazan", stars=5)

    response = client.get(
        "/api/v1/hotels",
        params={"city": "moscow", "stars": 5, "sort": "stars", "order": "asc", "page": 1, "size": 1},
    )

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["page"] == 1
    assert response.json()["size"] == 1
    assert response.json()["items"][0]["name"] == "Moscow Five"
    assert response.json()["items"][0]["avg_rating"] is None
    assert response.json()["items"][0]["reviews_count"] == 0
    assert response.json()["items"][0]["min_price"] is None
    assert response.json()["items"][0]["cover_image"] is None
    assert response.json()["items"][0]["is_favorite"] is None


def test_list_hotels_city_partial_match_case_insensitive(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        create_hotel(session, name="Hotel Moscow", city="Moscow", stars=4)
        create_hotel(session, name="Hotel Moskva", city="Москва", stars=4)
        create_hotel(session, name="Hotel Kazan", city="Kazan", stars=3)

    latin = client.get("/api/v1/hotels", params={"city": "mos"})
    assert latin.status_code == 200
    assert latin.json()["total"] == 1
    assert latin.json()["items"][0]["city"] == "Moscow"

    cyrillic = client.get("/api/v1/hotels", params={"city": "моск"})
    assert cyrillic.status_code == 200
    assert cyrillic.json()["total"] == 1
    assert cyrillic.json()["items"][0]["city"] == "Москва"


def test_list_hotels_city_filter_escapes_like_wildcards(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        create_hotel(session, name="Literal Percent", city="100%", stars=3)
        create_hotel(session, name="One Hundred", city="100", stars=3)
        create_hotel(session, name="Moscow", city="Moscow", stars=4)

    response = client.get("/api/v1/hotels", params={"city": "100%"})

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["city"] == "100%"


def test_get_hotel_returns_stage_three_detail(
    client: TestClient,
    test_session_factory: sessionmaker[Session],
) -> None:
    with test_session_factory() as session:
        hotel = create_hotel(session, name="Hotel Moscow", city="Moscow", stars=4)

    response = client.get(f"/api/v1/hotels/{hotel.id}")

    assert response.status_code == 200
    assert response.json()["id"] == hotel.id
    assert response.json()["images"] == []
    assert response.json()["is_favorite"] is None


def test_get_hotel_returns_404_when_missing(client: TestClient) -> None:
    response = client.get("/api/v1/hotels/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Hotel not found"}
