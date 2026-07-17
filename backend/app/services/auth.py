from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    refresh_token_expires_at,
    verify_password,
)
from app.models.enums import UserRole
from app.models.refresh_token import RefreshToken
from app.repositories import refresh_tokens, users
from app.schemas.auth import LoginRequest, RefreshTokenRequest, RegisterRequest, TokenPairResponse


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InvalidRefreshTokenError(Exception):
    pass


def register(session: Session, request: RegisterRequest) -> TokenPairResponse:
    if users.get_by_email(session, str(request.email)) is not None:
        raise EmailAlreadyRegisteredError

    try:
        user = users.create(
            session,
            name=request.name,
            email=str(request.email),
            password_hash=hash_password(request.password),
            phone=request.phone,
        )
        token_pair = _create_token_pair(session, user.id, user.role)
        session.commit()
        return token_pair
    except IntegrityError as error:
        session.rollback()
        raise EmailAlreadyRegisteredError from error


def login(session: Session, request: LoginRequest) -> TokenPairResponse:
    user = users.get_by_email(session, str(request.email))
    if user is None or not verify_password(request.password, user.password_hash):
        raise InvalidCredentialsError

    token_pair = _create_token_pair(session, user.id, user.role)
    session.commit()
    return token_pair


def refresh(session: Session, request: RefreshTokenRequest) -> TokenPairResponse:
    refresh_token = refresh_tokens.get_by_hash_for_update(
        session,
        hash_refresh_token(request.refresh_token),
    )
    if refresh_token is None or not _is_active_refresh_token(refresh_token):
        raise InvalidRefreshTokenError

    refresh_tokens.revoke(refresh_token)
    token_pair = _create_token_pair(session, refresh_token.user_id, refresh_token.user.role)
    session.commit()
    return token_pair


def logout(session: Session, *, user_id: int, request: RefreshTokenRequest) -> None:
    refresh_token = refresh_tokens.get_by_hash_for_update(
        session,
        hash_refresh_token(request.refresh_token),
    )
    if (
        refresh_token is None
        or refresh_token.user_id != user_id
        or not _is_active_refresh_token(refresh_token)
    ):
        raise InvalidRefreshTokenError

    refresh_tokens.revoke(refresh_token)
    session.commit()


def _create_token_pair(session: Session, user_id: int, role: UserRole) -> TokenPairResponse:
    access_token = create_access_token(user_id=user_id, role=role)
    refresh_token = create_refresh_token()
    refresh_tokens.create(
        session,
        user_id=user_id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=refresh_token_expires_at(),
    )
    return TokenPairResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


def _is_active_refresh_token(refresh_token: RefreshToken) -> bool:
    expires_at = refresh_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return refresh_token.revoked_at is None and expires_at > datetime.now(timezone.utc)
