"""
User SQLAlchemy Model

This module defines the User database model for the beansprout application.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, Index, String, func
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import DeclarativeBase


def utc_now():
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(UTC)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


class User(Base):
    """
    User model for storing user account information.

    Attributes:
        id: Unique identifier (UUID)
        email: User's email address (unique)
        password_hash: Bcrypt hashed password
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )
    password_hash = Column(
        String(255),
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=utc_now,
        nullable=False
    )

    # Profile fields
    display_name = Column(String(255), nullable=True)
    bio = Column(String(500), nullable=True)
    favorite_genres = Column(JSON, nullable=True)
    reading_history = Column(JSON, nullable=True)
    profile_photo_url = Column(String(500), nullable=True)

    # Create index on email for faster lookups
    __table_args__ = (
        Index('idx_users_email', 'email'),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
