"""Create users and refresh tokens tables.

Revision ID: 20260717_0002
Revises: 20260717_0001
Create Date: 2026-07-17
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260717_0002"
down_revision: str | None = "20260717_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column(
            "role",
            sa.Enum("CLIENT", "ADMIN", name="user_role", native_enum=False),
            nullable=False,
            server_default=sa.text("'CLIENT'"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.CheckConstraint("char_length(name) BETWEEN 1 AND 100", name="ck_users_name_length"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_refresh_tokens_user_id_users",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("token_hash", name="uq_refresh_tokens_token_hash"),
    )
    op.create_index("ix_refresh_tokens_expires_at", "refresh_tokens", ["expires_at"], unique=False)
    op.create_index("ix_refresh_tokens_user_id", "refresh_tokens", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_refresh_tokens_user_id", table_name="refresh_tokens")
    op.drop_index("ix_refresh_tokens_expires_at", table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_table("users")
