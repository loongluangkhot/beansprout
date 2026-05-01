"""
Season membership SQLAlchemy model.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base


class SeasonMember(Base):
    """Membership link between users and seasons."""

    __tablename__ = "season_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    season_id = Column(UUID(as_uuid=True), ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("season_id", "user_id", name="uq_season_members_season_user"),
        Index("idx_season_members_season_id", "season_id"),
        Index("idx_season_members_user_id", "user_id"),
    )
