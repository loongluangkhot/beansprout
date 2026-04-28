"""Add profile fields to users table

Revision ID: 002
Revises: 001
Create Date: 2026-04-25
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add profile-related columns required by Epic 1."""
    op.add_column("users", sa.Column("display_name", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("bio", sa.String(length=500), nullable=True))
    op.add_column("users", sa.Column("favorite_genres", sa.JSON(), nullable=True))
    op.add_column("users", sa.Column("reading_history", sa.JSON(), nullable=True))
    op.add_column("users", sa.Column("profile_photo_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Remove profile-related columns."""
    op.drop_column("users", "profile_photo_url")
    op.drop_column("users", "reading_history")
    op.drop_column("users", "favorite_genres")
    op.drop_column("users", "bio")
    op.drop_column("users", "display_name")

