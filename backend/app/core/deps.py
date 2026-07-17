from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_session
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.users import get_by_id


bearer_scheme = HTTPBearer(auto_error=False)
SessionDependency = Annotated[Session, Depends(get_session)]


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    session: SessionDependency,
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        user_id = decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from error

    user = get_by_id(session, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    return user


CurrentUserDependency = Annotated[User, Depends(get_current_user)]


def require_admin(current_user: CurrentUserDependency) -> User:
    if current_user.role is not UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

    return current_user
