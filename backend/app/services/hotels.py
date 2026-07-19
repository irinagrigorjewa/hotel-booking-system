from sqlalchemy.orm import Session

from app.models.enums import ImageEntityType
from app.models.hotel import Hotel
from app.repositories import bookings, hotels
from app.schemas.hotel import (
    HotelCreate,
    HotelDetail,
    HotelImage,
    HotelListItem,
    HotelPage,
    HotelUpdate,
)
from app.services import images as images_service


class HotelNotFoundError(Exception):
    pass


class HotelHasActiveBookingsError(Exception):
    pass


def get_hotel(session: Session, hotel_id: int) -> HotelDetail:
    hotel = hotels.get_by_id(session, hotel_id)
    if hotel is None:
        raise HotelNotFoundError
    return _to_detail(session, hotel)


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
        items=[_to_list_item(session, hotel) for hotel in hotel_items],
        total=total,
        page=page,
        size=size,
    )


def create_hotel(session: Session, request: HotelCreate) -> HotelDetail:
    hotel = hotels.create(session, **request.model_dump())
    session.commit()
    session.refresh(hotel)
    return _to_detail(session, hotel)


def update_hotel(session: Session, hotel_id: int, request: HotelUpdate) -> HotelDetail:
    hotel = _get_hotel_or_raise(session, hotel_id)
    hotels.update(hotel, **request.model_dump())
    session.commit()
    session.refresh(hotel)
    return _to_detail(session, hotel)


def delete_hotel(session: Session, hotel_id: int) -> None:
    hotel = _get_hotel_or_raise(session, hotel_id)
    if bookings.hotel_has_active_bookings(session, hotel_id):
        raise HotelHasActiveBookingsError
    images_service.delete_entity_images(
        session,
        entity_type=ImageEntityType.HOTEL,
        entity_id=hotel_id,
    )
    hotels.delete(session, hotel)
    session.commit()


def _get_hotel_or_raise(session: Session, hotel_id: int) -> Hotel:
    hotel = hotels.get_by_id(session, hotel_id)
    if hotel is None:
        raise HotelNotFoundError
    return hotel


def _hotel_images(session: Session, hotel_id: int) -> list[HotelImage]:
    return [
        HotelImage(id=image.id, url=image.url, sort_order=image.sort_order)
        for image in images_service.list_image_dtos(
            session,
            entity_type=ImageEntityType.HOTEL,
            entity_id=hotel_id,
        )
    ]


def _to_list_item(session: Session, hotel: Hotel) -> HotelListItem:
    image_items = _hotel_images(session, hotel.id)
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
        cover_image=image_items[0].url if image_items else None,
        is_favorite=None,
    )


def _to_detail(session: Session, hotel: Hotel) -> HotelDetail:
    list_item = _to_list_item(session, hotel)
    return HotelDetail(**list_item.model_dump(), images=_hotel_images(session, hotel.id))
