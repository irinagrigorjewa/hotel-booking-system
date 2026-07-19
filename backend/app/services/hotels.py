from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.enums import ImageEntityType
from app.models.hotel import Hotel
from app.models.user import User
from app.repositories import bookings, favorites, hotels, reviews
from app.schemas.hotel import (
    HotelCreate,
    HotelDetail,
    HotelImage,
    HotelListItem,
    HotelMapItem,
    HotelMapResponse,
    HotelPage,
    HotelUpdate,
)
from app.services import images as images_service


class HotelNotFoundError(Exception):
    pass


class HotelHasActiveBookingsError(Exception):
    pass


def get_hotel(
    session: Session,
    hotel_id: int,
    current_user: User | None = None,
) -> HotelDetail:
    hotel = hotels.get_by_id(session, hotel_id)
    if hotel is None:
        raise HotelNotFoundError
    return _to_detail(session, hotel, current_user=current_user)


def get_hotels(
    session: Session,
    *,
    city: str | None,
    stars: int | None,
    sort: hotels.HotelSort,
    order: hotels.SortOrder,
    page: int,
    size: int,
    current_user: User | None = None,
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
    favorite_ids: set[int] = set()
    if current_user is not None:
        favorite_ids = favorites.favorite_hotel_ids(
            session,
            user_id=current_user.id,
            hotel_ids=[hotel.id for hotel in hotel_items],
        )
    return HotelPage(
        items=[
            _to_list_item(
                session,
                hotel,
                current_user=current_user,
                favorite_ids=favorite_ids,
            )
            for hotel in hotel_items
        ],
        total=total,
        page=page,
        size=size,
    )


def get_hotels_map(session: Session, *, city: str | None) -> HotelMapResponse:
    rows = hotels.list_for_map(session, city=city)
    return HotelMapResponse(
        items=[
            HotelMapItem(
                id=hotel.id,
                name=hotel.name,
                latitude=hotel.latitude,
                longitude=hotel.longitude,
                stars=hotel.stars,
                min_price=min_price,
                avg_rating=avg_rating,
            )
            for hotel, min_price, avg_rating in rows
        ]
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


def to_list_item(
    session: Session,
    hotel: Hotel,
    *,
    current_user: User | None = None,
) -> HotelListItem:
    return _to_list_item(session, hotel, current_user=current_user)


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


def _to_list_item(
    session: Session,
    hotel: Hotel,
    *,
    current_user: User | None = None,
    favorite_ids: set[int] | None = None,
    min_price_map: dict[int, Decimal | None] | None = None,
) -> HotelListItem:
    image_items = _hotel_images(session, hotel.id)
    avg_rating, reviews_count = reviews.rating_stats(session, [hotel.id])[hotel.id]
    is_favorite: bool | None = None
    if current_user is not None:
        if favorite_ids is not None:
            is_favorite = hotel.id in favorite_ids
        else:
            is_favorite = (
                favorites.get(session, user_id=current_user.id, hotel_id=hotel.id) is not None
            )
    if min_price_map is not None:
        min_price = min_price_map.get(hotel.id)
    else:
        min_price = hotels.min_prices(session, [hotel.id]).get(hotel.id)
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
        avg_rating=avg_rating,
        reviews_count=reviews_count,
        min_price=min_price,
        cover_image=image_items[0].url if image_items else None,
        is_favorite=is_favorite,
    )


def _to_detail(
    session: Session,
    hotel: Hotel,
    *,
    current_user: User | None = None,
) -> HotelDetail:
    list_item = _to_list_item(session, hotel, current_user=current_user)
    return HotelDetail(**list_item.model_dump(), images=_hotel_images(session, hotel.id))
