from datetime import datetime, timedelta, timezone
from hashlib import sha256
from secrets import token_urlsafe

import jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.models.enums import UserRole


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_context.verify(password, password_hash)


def create_access_token(*, user_id: int, role: UserRole) -> str:
    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {
            "sub": str(user_id),
            "role": role.value,
            "iat": issued_at,
            "exp": expires_at,
            "jti": token_urlsafe(16),
            "type": "access",
        },
        settings.secret_key,
        algorithm="HS256",
    )


def decode_access_token(access_token: str) -> int:
    payload = jwt.decode(access_token, settings.secret_key, algorithms=["HS256"])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Invalid token type")

    try:
        return int(payload["sub"])
    except (KeyError, TypeError, ValueError) as error:
        raise jwt.InvalidTokenError("Invalid subject") from error


def create_refresh_token() -> str:
    return token_urlsafe(48)


def hash_refresh_token(refresh_token: str) -> str:
    return sha256(refresh_token.encode()).hexdigest()


def refresh_token_expires_at() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
