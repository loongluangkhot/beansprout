"""
Meetup SQLAlchemy model.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


def utc_now():
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(UTC)


class Meetup(Base):
    """Meetup model representing scheduled season meetings."""

    __tablename__ = "meetups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    season_id = Column(UUID(as_uuid=True), ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False)
    starts_at = Column(DateTime(timezone=True), nullable=False)
    location_name = Column(String(255), nullable=True)
    location_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=utc_now, nullable=False
    )

    __table_args__ = (Index("idx_meetups_season_starts_at", "season_id", "starts_at"),)
