"""Create season domain entities

Revision ID: 003
Revises: 002
Create Date: 2026-05-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create seasons, meetups, and season_members tables."""
    op.create_table(
        "seasons",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("theme", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("book_title", sa.String(length=255), nullable=False),
        sa.Column("book_author", sa.String(length=255), nullable=False),
        sa.Column("cover_image_url", sa.String(length=500), nullable=True),
        sa.Column("location_name", sa.String(length=255), nullable=True),
        sa.Column("location_url", sa.String(length=500), nullable=True),
        sa.Column("max_members", sa.Integer(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("status", sa.String(length=50), nullable=False, server_default=sa.text("'draft'")),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_seasons_public_status", "seasons", ["is_public", "status"], unique=False)
    op.create_index("idx_seasons_created_at", "seasons", ["created_at"], unique=False)
    op.create_index(
        "idx_seasons_created_by_user_id", "seasons", ["created_by_user_id"], unique=False
    )

    op.create_table(
        "meetups",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("season_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("location_name", sa.String(length=255), nullable=True),
        sa.Column("location_url", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(["season_id"], ["seasons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_meetups_season_starts_at", "meetups", ["season_id", "starts_at"], unique=False)

    op.create_table(
        "season_members",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("season_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(["season_id"], ["seasons.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("season_id", "user_id", name="uq_season_members_season_user"),
    )
    op.create_index("idx_season_members_season_id", "season_members", ["season_id"], unique=False)
    op.create_index("idx_season_members_user_id", "season_members", ["user_id"], unique=False)


def downgrade() -> None:
    """Drop seasons domain tables."""
    op.drop_index("idx_season_members_user_id", table_name="season_members")
    op.drop_index("idx_season_members_season_id", table_name="season_members")
    op.drop_table("season_members")

    op.drop_index("idx_meetups_season_starts_at", table_name="meetups")
    op.drop_table("meetups")

    op.drop_index("idx_seasons_created_by_user_id", table_name="seasons")
    op.drop_index("idx_seasons_created_at", table_name="seasons")
    op.drop_index("idx_seasons_public_status", table_name="seasons")
    op.drop_table("seasons")
