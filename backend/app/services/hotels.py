from sqlalchemy.orm import Session

from app.models.hotel import Hotel
from app.repositories import hotels
from app.schemas.hotel import HotelCreate, HotelDetail, HotelListItem, HotelPage, HotelUpdate


class HotelNotFoundError(Exception):
    pass


def get_hotel(session: Session, hotel_id: int) -> HotelDetail:
    hotel = hotels.get_by_id(session, hotel_id)
    if hotel is None:
        raise HotelNotFoundError
    return _to_detail(hotel)


def get_hotels(
    session: Session,
    *,
    city: str | None,
    stars: int | None,
    sort: hotels.HotelSort,
    order: hotels.SortOrder,
    page: int,
    size: int,
) -> HotelPage:
    hotel_items, total = hotels.list_hotels(
        session,
        city=city,
        stars=stars,
        sort=sort,
        order=order,
        page=page,
        size=size,
    )
    return HotelPage(
        items=[_to_list_item(hotel) for hotel in hotel_items],
        total=total,
        page=page,
        size=size,
    )


def create_hotel(session: Session, request: HotelCreate) -> HotelDetail:
    hotel = hotels.create(session, **request.model_dump())
    session.commit()
    session.refresh(hotel)
    return _to_detail(hotel)


def update_hotel(session: Session, hotel_id: int, request: HotelUpdate) -> HotelDetail:
    hotel = _get_hotel_or_raise(session, hotel_id)
    hotels.update(hotel, **request.model_dump())
    session.commit()
    session.refresh(hotel)
    return _to_detail(hotel)


def delete_hotel(session: Session, hotel_id: int) -> None:
    hotel = _get_hotel_or_raise(session, hotel_id)
    hotels.delete(session, hotel)
    session.commit()


def _get_hotel_or_raise(session: Session, hotel_id: int) -> Hotel:
    hotel = hotels.get_by_id(session, hotel_id)
    if hotel is None:
        raise HotelNotFoundError
    return hotel


def _to_list_item(hotel: Hotel) -> HotelListItem:
    return HotelListItem(
        id=hotel.id,
        name=hotel.name,
        city=hotel.city,
        address=hotel.address,
        description=hotel.description,
        stars=hotel.stars,
        latitude=hotel.latitude,
        longitude=hotel.longitude,
        created_at=hotel.created_at,
        avg_rating=None,
        reviews_count=0,
        min_price=None,
        cover_image=None,
        is_favorite=None,
    )


def _to_detail(hotel: Hotel) -> HotelDetail:
    return HotelDetail(**_to_list_item(hotel).model_dump(), images=[])
