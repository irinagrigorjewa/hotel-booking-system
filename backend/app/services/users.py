from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User
from app.repositories import users as users_repo
from app.schemas.user import UserMeUpdate, UserPage, UserPublic, UserUpdate


class UserNotFoundError(Exception):
    pass


class UserForbiddenError(Exception):
    pass


class LastAdminError(Exception):
    pass


def list_users(
    session: Session,
    *,
    search: str | None,
    page: int,
    size: int,
) -> UserPage:
    items, total = users_repo.list_users(session, search=search, page=page, size=size)
    return UserPage(
        items=[UserPublic.model_validate(item) for item in items],
        total=total,
        page=page,
        size=size,
    )


def get_user(session: Session, user_id: int, current_user: User) -> UserPublic:
    user = users_repo.get_by_id(session, user_id)
    if user is None:
        raise UserNotFoundError
    if current_user.role is not UserRole.ADMIN and current_user.id != user_id:
        raise UserForbiddenError
    return UserPublic.model_validate(user)


def update_me(session: Session, current_user: User, request: UserMeUpdate) -> UserPublic:
    user = users_repo.get_by_id(session, current_user.id)
    if user is None:
        raise UserNotFoundError

    if request.name is not None:
        user.name = request.name
    if "phone" in request.model_fields_set:
        user.phone = request.phone

    session.commit()
    session.refresh(user)
    return UserPublic.model_validate(user)


def update_user(
    session: Session,
    user_id: int,
    current_user: User,
    request: UserUpdate,
) -> UserPublic:
    user = users_repo.get_by_id(session, user_id)
    if user is None:
        raise UserNotFoundError

    is_admin = current_user.role is UserRole.ADMIN
    is_owner = current_user.id == user_id

    if not is_admin and not is_owner:
        raise UserForbiddenError
    if request.role is not None and not is_admin:
        raise UserForbiddenError

    if request.role is not None and user.role is UserRole.ADMIN and request.role is UserRole.CLIENT:
        if users_repo.count_admins(session) <= 1:
            raise LastAdminError

    if request.name is not None:
        user.name = request.name
    if "phone" in request.model_fields_set:
        user.phone = request.phone
    if request.role is not None:
        user.role = request.role

    session.commit()
    session.refresh(user)
    return UserPublic.model_validate(user)
