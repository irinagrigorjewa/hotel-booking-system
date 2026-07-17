from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database.session import get_session
from app.schemas.auth import LoginRequest, RefreshTokenRequest, RegisterRequest, TokenPairResponse
from app.services.auth import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
    login,
    logout,
    refresh,
    register,
)


router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])
SessionDependency = Annotated[Session, Depends(get_session)]
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> int:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        return decode_access_token(credentials.credentials)
    except jwt.InvalidTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from error


CurrentUserIdDependency = Annotated[int, Depends(get_current_user_id)]


@router.post(
    "/register",
    response_model=TokenPairResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"description": "Email already registered"}},
)
def register_user(request: RegisterRequest, session: SessionDependency) -> TokenPairResponse:
    try:
        return register(session, request)
    except EmailAlreadyRegisteredError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from error


@router.post(
    "/login",
    response_model=TokenPairResponse,
    responses={401: {"description": "Invalid credentials"}},
)
def login_user(request: LoginRequest, session: SessionDependency) -> TokenPairResponse:
    try:
        return login(session, request)
    except InvalidCredentialsError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from error


@router.post(
    "/refresh",
    response_model=TokenPairResponse,
    responses={401: {"description": "Invalid refresh token"}},
)
def refresh_token(
    request: RefreshTokenRequest,
    session: SessionDependency,
) -> TokenPairResponse:
    try:
        return refresh(session, request)
    except InvalidRefreshTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from error


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={401: {"description": "Invalid access or refresh token"}},
)
def logout_user(
    request: RefreshTokenRequest,
    session: SessionDependency,
    user_id: CurrentUserIdDependency,
) -> Response:
    try:
        logout(session, user_id=user_id, request=request)
    except InvalidRefreshTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
