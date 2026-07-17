from app.database.base import Base
from app.models.enums import UserRole


def test_auth_models_register_required_schema() -> None:
    users = Base.metadata.tables["users"]
    refresh_tokens = Base.metadata.tables["refresh_tokens"]

    assert set(users.c.keys()) == {
        "id",
        "name",
        "email",
        "password_hash",
        "phone",
        "role",
        "created_at",
    }
    assert users.c.email.unique is True
    assert users.c.role.default.arg == UserRole.CLIENT

    assert set(refresh_tokens.c.keys()) == {
        "id",
        "user_id",
        "token_hash",
        "expires_at",
        "revoked_at",
        "created_at",
    }
    assert refresh_tokens.c.token_hash.unique is True
    assert next(iter(refresh_tokens.c.user_id.foreign_keys)).ondelete == "CASCADE"
    assert {index.name for index in refresh_tokens.indexes} == {
        "ix_refresh_tokens_expires_at",
        "ix_refresh_tokens_user_id",
    }
