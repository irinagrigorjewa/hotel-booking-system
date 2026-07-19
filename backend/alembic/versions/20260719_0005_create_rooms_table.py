"""Create rooms table.

Revision ID: 20260719_0005
Revises: 20260718_0004
Create Date: 2026-07-19
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260719_0005"
down_revision: str | None = "20260718_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "rooms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("hotel_id", sa.Integer(), sa.ForeignKey("hotels.id"), nullable=False),
        sa.Column(
            "room_type_id",
            sa.Integer(),
            sa.ForeignKey("room_types.id"),
            nullable=False,
        ),
        sa.Column("number", sa.String(length=50), nullable=False),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("AVAILABLE", "MAINTENANCE", name="room_status"),
            nullable=False,
        ),
        sa.UniqueConstraint("hotel_id", "number", name="uq_rooms_hotel_number"),
        sa.CheckConstraint("price > 0", name="ck_rooms_price_positive"),
        sa.CheckConstraint("capacity >= 1", name="ck_rooms_capacity"),
    )
    op.create_index("ix_rooms_hotel_id", "rooms", ["hotel_id"])
    op.create_index("ix_rooms_room_type_id", "rooms", ["room_type_id"])
    op.create_index("ix_rooms_price", "rooms", ["price"])
    op.create_index("ix_rooms_capacity", "rooms", ["capacity"])
    op.create_index("ix_rooms_status", "rooms", ["status"])


def downgrade() -> None:
    op.drop_index("ix_rooms_status", table_name="rooms")
    op.drop_index("ix_rooms_capacity", table_name="rooms")
    op.drop_index("ix_rooms_price", table_name="rooms")
    op.drop_index("ix_rooms_room_type_id", table_name="rooms")
    op.drop_index("ix_rooms_hotel_id", table_name="rooms")
    op.drop_table("rooms")
    sa.Enum(name="room_status").drop(op.get_bind(), checkfirst=True)
