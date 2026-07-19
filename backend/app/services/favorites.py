from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories import favorites, hotels
from app.schemas.favorite import FavoriteCreated
from app.schemas.hotel import HotelPage
from app.services import hotels as hotels_service


class HotelNotFoundError(Exception):
    pass


class FavoriteAlreadyExistsError(Exception):
    pass


class FavoriteNotFoundError(Exception):
    pass


def list_favorites(
    session: Session,
    current_user: User,
    *,
    page: int,
    size: int,
) -> HotelPage:
    hotel_ids, total = favorites.list_hotel_ids(
        session,
        user_id=current_user.id,
        page=page,
        size=size,
    )
    items = []
    for hotel_id in hotel_ids:
        hotel = hotels.get_by_id(session, hotel_id)
        if hotel is None:
            continue
        item = hotels_service.to_list_item(session, hotel, current_user=current_user)
        items.append(item)
    return HotelPage(items=items, total=total, page=page, size=size)


def add_favorite(session: Session, current_user: User, hotel_id: int) -> FavoriteCreated:
    if hotels.get_by_id(session, hotel_id) is None:
        raise HotelNotFoundError
    existing = favorites.get(session, user_id=current_user.id, hotel_id=hotel_id)
    if existing is not None:
        raise FavoriteAlreadyExistsError
    try:
        favorite = favorites.create(
            session,
            user_id=current_user.id,
            hotel_id=hotel_id,
        )
    except favorites.FavoriteAlreadyExistsError as error:
        raise FavoriteAlreadyExistsError from error
    session.commit()
    session.refresh(favorite)
    return FavoriteCreated(
        hotel_id=favorite.hotel_id,
        user_id=favorite.user_id,
        created_at=favorite.created_at,
    )


def remove_favorite(session: Session, current_user: User, hotel_id: int) -> None:
    if hotels.get_by_id(session, hotel_id) is None:
        raise HotelNotFoundError
    favorite = favorites.get(session, user_id=current_user.id, hotel_id=hotel_id)
    if favorite is None:
        raise FavoriteNotFoundError
    favorites.delete(session, favorite)
    session.commit()
