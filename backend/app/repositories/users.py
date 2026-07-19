from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User


def get_by_id(session: Session, user_id: int) -> User | None:
    return session.get(User, user_id)


def get_by_email(session: Session, email: str) -> User | None:
    return session.scalar(select(User).where(User.email == email))


def create(
    session: Session,
    *,
    name: str,
    email: str,
    password_hash: str,
    phone: str | None,
    role: UserRole = UserRole.CLIENT,
) -> User:
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        phone=phone,
        role=role,
    )
    session.add(user)
    session.flush()
    return user


def list_users(
    session: Session,
    *,
    search: str | None,
    page: int,
    size: int,
) -> tuple[list[User], int]:
    statement = select(User)
    count_statement = select(func.count()).select_from(User)

    if search:
        pattern = f"%{search}%"
        filter_expr = or_(User.email.ilike(pattern), User.name.ilike(pattern))
        statement = statement.where(filter_expr)
        count_statement = count_statement.where(filter_expr)

    total = int(session.scalar(count_statement) or 0)
    items = list(
        session.scalars(
            statement.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size)
        ).all()
    )
    return items, total


def count_admins(session: Session) -> int:
    return int(
        session.scalar(
            select(func.count()).select_from(User).where(User.role == UserRole.ADMIN)
        )
        or 0
    )
