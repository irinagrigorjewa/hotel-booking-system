from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.database.base import Base
from app.database.session import get_session
from app.main import app


def _register_unicode_lower(dbapi_connection: object, _connection_record: object) -> None:
    # SQLite's built-in lower() is ASCII-only; Python lower matches Postgres ILIKE for Cyrillic.
    dbapi_connection.create_function(  # type: ignore[attr-defined]
        "lower",
        1,
        lambda value: value.lower() if isinstance(value, str) else value,
    )


@pytest.fixture
def test_session_factory() -> Generator[sessionmaker[Session], None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    event.listen(engine, "connect", _register_unicode_lower)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)

    try:
        yield session_factory
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture
def client(
    test_session_factory: sessionmaker[Session],
) -> Generator[TestClient, None, None]:
    previous_secret_key = settings.secret_key
    settings.secret_key = "test-secret-key-with-at-least-32-characters"

    def get_test_session() -> Generator[Session, None, None]:
        with test_session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = get_test_session

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
        settings.secret_key = previous_secret_key
