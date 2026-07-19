from pathlib import Path

from sqlalchemy.orm import Session, sessionmaker

from app.models.enums import ImageEntityType, UserRole
from app.models.hotel import Hotel
from app.models.image import Image
from app.models.review import Review
from app.models.room import Room
from app.models.room_type import RoomType
from app.models.user import User
from app.seed import ADMIN_EMAIL, CLIENT_EMAIL, run_seed


def test_seed_inserts_demo_data(
    test_session_factory: sessionmaker[Session],
    tmp_path: Path,
) -> None:
    with test_session_factory() as session:
        assert run_seed(session, upload_dir=tmp_path) is True

        admin = session.query(User).filter_by(email=ADMIN_EMAIL).one()
        client = session.query(User).filter_by(email=CLIENT_EMAIL).one()
        assert admin.role is UserRole.ADMIN
        assert client.role is UserRole.CLIENT
        assert session.query(Hotel).count() >= 2
        assert session.query(RoomType).count() >= 2
        assert session.query(Room).count() >= 3
        assert session.query(Image).filter_by(entity_type=ImageEntityType.HOTEL).count() >= 2
        assert session.query(Review).count() >= 1
        assert (tmp_path / "hotels").exists()


def test_seed_is_idempotent(
    test_session_factory: sessionmaker[Session],
    tmp_path: Path,
) -> None:
    with test_session_factory() as session:
        assert run_seed(session, upload_dir=tmp_path) is True
        hotel_count = session.query(Hotel).count()

    with test_session_factory() as session:
        assert run_seed(session, upload_dir=tmp_path) is False
        assert session.query(Hotel).count() == hotel_count
        assert session.query(User).filter_by(email=ADMIN_EMAIL).count() == 1
