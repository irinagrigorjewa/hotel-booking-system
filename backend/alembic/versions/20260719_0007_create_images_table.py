"""Create images table.

Revision ID: 20260719_0007
Revises: 20260719_0006
Create Date: 2026-07-19
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260719_0007"
down_revision: str | None = "20260719_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "entity_type",
            sa.Enum("HOTEL", "ROOM", name="image_entity_type"),
            nullable=False,
        ),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_images_entity_type_entity_id",
        "images",
        ["entity_type", "entity_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_images_entity_type_entity_id", table_name="images")
    op.drop_table("images")
    sa.Enum(name="image_entity_type").drop(op.get_bind(), checkfirst=True)
