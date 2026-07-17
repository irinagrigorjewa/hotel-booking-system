from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_by_email(session: Session, email: str) -> User | None:
    return session.scalar(select(User).where(User.email == email))


def create(
    session: Session,
    *,
    name: str,
    email: str,
    password_hash: str,
    phone: str | None,
) -> User:
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        phone=phone,
    )
    session.add(user)
    session.flush()
    return user
