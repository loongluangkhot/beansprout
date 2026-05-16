"""Add location mode and address to seasons.

Revision ID: 005_add_location_mode_address_to_seasons
Revises: 004_add_membership_mode_to_seasons
Create Date: 2026-05-04
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "005_add_location_mode_address_to_seasons"
down_revision: Union[str, None] = "004_add_membership_mode_to_seasons"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add explicit location mode and address fields to seasons."""
    op.add_column(
        "seasons",
        sa.Column("location_mode", sa.String(length=50), nullable=False, server_default="in-person"),
    )
    op.add_column("seasons", sa.Column("location_address", sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Remove explicit location mode and address fields from seasons."""
    op.drop_column("seasons", "location_address")
    op.drop_column("seasons", "location_mode")
