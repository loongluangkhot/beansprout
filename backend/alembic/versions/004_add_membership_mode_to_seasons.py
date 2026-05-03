"""Add membership_mode to seasons.

Revision ID: 004_add_membership_mode_to_seasons
Revises: 003_create_season_entities
Create Date: 2026-05-03
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "004_add_membership_mode_to_seasons"
down_revision = "003_create_season_entities"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "seasons",
        sa.Column("membership_mode", sa.String(length=50), nullable=False, server_default="auto-join"),
    )


def downgrade() -> None:
    op.drop_column("seasons", "membership_mode")
