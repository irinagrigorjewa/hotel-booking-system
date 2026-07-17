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
from app.repositories import refresh_tokens, users
from app.schemas.auth import LoginRequest, RegisterRequest, TokenPairResponse


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
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
