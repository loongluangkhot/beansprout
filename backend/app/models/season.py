"""
Season SQLAlchemy model.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


def utc_now():
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(UTC)


class Season(Base):
    """Season model for public and private book club seasons."""

    __tablename__ = "seasons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    title = Column(String(255), nullable=False)
    theme = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    book_title = Column(String(255), nullable=False)
    book_author = Column(String(255), nullable=False)
    cover_image_url = Column(String(500), nullable=True)
    location_mode = Column(String(50), nullable=False, server_default="in-person")
    location_name = Column(String(255), nullable=True)
    location_url = Column(String(500), nullable=True)
    location_address = Column(String(500), nullable=True)
    max_members = Column(Integer, nullable=True)
    membership_mode = Column(String(50), nullable=False, server_default="auto-join")
    is_public = Column(Boolean, nullable=False, server_default="true")
    status = Column(String(50), nullable=False, server_default="draft")
    created_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=utc_now, nullable=False
    )

    __table_args__ = (
        Index("idx_seasons_public_status", "is_public", "status"),
        Index("idx_seasons_created_at", "created_at"),
        Index("idx_seasons_created_by_user_id", "created_by_user_id"),
    )
