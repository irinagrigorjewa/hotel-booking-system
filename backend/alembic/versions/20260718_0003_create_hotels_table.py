"""Create hotels table.

Revision ID: 20260718_0003
Revises: 20260717_0002
Create Date: 2026-07-18
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260718_0003"
down_revision: str | None = "20260717_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "hotels",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("stars", sa.Integer(), nullable=False),
        sa.Column("latitude", sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column("longitude", sa.Numeric(precision=9, scale=6), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.CheckConstraint("stars BETWEEN 1 AND 5", name="ck_hotels_stars_range"),
        sa.CheckConstraint("latitude BETWEEN -90 AND 90", name="ck_hotels_latitude_range"),
        sa.CheckConstraint("longitude BETWEEN -180 AND 180", name="ck_hotels_longitude_range"),
    )
    op.create_index("ix_hotels_city", "hotels", ["city"], unique=False)
    op.create_index("ix_hotels_stars", "hotels", ["stars"], unique=False)
    op.create_index("ix_hotels_created_at", "hotels", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_hotels_created_at", table_name="hotels")
    op.drop_index("ix_hotels_stars", table_name="hotels")
    op.drop_index("ix_hotels_city", table_name="hotels")
    op.drop_table("hotels")
