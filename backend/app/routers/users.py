from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.database.session import get_session
from app.models.user import User
from app.schemas.user import UserMeUpdate, UserPage, UserPublic, UserUpdate
from app.services import users

router = APIRouter(prefix="/api/v1/users", tags=["Users"])
SessionDependency = Annotated[Session, Depends(get_session)]
CurrentUserDependency = Annotated[User, Depends(get_current_user)]
AdminDependency = Annotated[User, Depends(require_admin)]
PageQuery = Annotated[int, Query(ge=1)]
SizeQuery = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=UserPage)
def list_users(
    session: SessionDependency,
    _: AdminDependency,
    search: Annotated[str | None, Query()] = None,
    page: PageQuery = 1,
    size: SizeQuery = 20,
) -> UserPage:
    return users.list_users(session, search=search, page=page, size=size)


@router.patch("/me", response_model=UserPublic)
def update_me(
    request: UserMeUpdate,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> UserPublic:
    try:
        return users.update_me(session, current_user, request)
    except users.UserNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        ) from error


@router.get(
    "/{user_id}",
    response_model=UserPublic,
    responses={403: {"description": "Forbidden"}, 404: {"description": "Not found"}},
)
def get_user(
    user_id: int,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> UserPublic:
    try:
        return users.get_user(session, user_id, current_user)
    except users.UserNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        ) from error
    except users.UserForbiddenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        ) from error


@router.patch(
    "/{user_id}",
    response_model=UserPublic,
    responses={
        400: {"description": "Cannot demote last admin"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    },
)
def update_user(
    user_id: int,
    request: UserUpdate,
    session: SessionDependency,
    current_user: CurrentUserDependency,
) -> UserPublic:
    try:
        return users.update_user(session, user_id, current_user, request)
    except users.UserNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        ) from error
    except users.UserForbiddenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        ) from error
    except users.LastAdminError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote the last admin",
        ) from error
