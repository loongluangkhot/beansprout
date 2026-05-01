"""
Profile Pydantic Schemas

This module defines Pydantic models for profile-related request/response validation.
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class ReadingHistoryItem(BaseModel):
    """Schema for a single reading history entry."""

    title: str
    author: str
    completed_date: Optional[date] = None

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @field_validator('author')
    @classmethod
    def validate_author(cls, v: str) -> str:
        """Validate author is not empty."""
        if not v or not v.strip():
            raise ValueError("Author cannot be empty")
        return v.strip()


# Valid genre options
VALID_GENRES = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Sci-Fi",
    "Fantasy",
    "Romance",
    "Historical",
    "Biography",
    "Self-Help",
    "Other",
]


class ProfileUpdate(BaseModel):
    """Schema for profile update request."""

    bio: Optional[str] = None
    favorite_genres: Optional[list[str]] = None
    reading_history: Optional[list[ReadingHistoryItem]] = None

    @field_validator('bio')
    @classmethod
    def validate_bio_length(cls, v: Optional[str]) -> Optional[str]:
        """Validate bio doesn't exceed 500 characters."""
        if v is not None and len(v) > 500:
            raise ValueError("Bio must be 500 characters or less")
        return v

    @field_validator('favorite_genres')
    @classmethod
    def validate_genres(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        """Validate genre selections."""
        if v is not None:
            if len(v) > 5:
                raise ValueError("Maximum 5 genres allowed")
            for genre in v:
                if genre not in VALID_GENRES:
                    raise ValueError(f"Invalid genre: {genre}. Valid genres: {', '.join(VALID_GENRES)}")
        return v

    @field_validator('reading_history')
    @classmethod
    def validate_reading_history(cls, v: Optional[list[ReadingHistoryItem]]) -> Optional[list[ReadingHistoryItem]]:
        """Validate reading history entries."""
        if v is not None:
            if len(v) > 20:
                raise ValueError("Maximum 20 books in reading history")
        return v


class ProfileResponse(BaseModel):
    """Schema for profile data in responses."""

    id: UUID
    email: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    favorite_genres: Optional[list[str]] = None
    reading_history: Optional[list[ReadingHistoryItem]] = None
    profile_photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PublicProfileData(BaseModel):
    """Schema for public profile data visible to other members."""

    id: UUID
    display_name: Optional[str] = None
    bio: Optional[str] = None
    favorite_genres: Optional[list[str]] = None
    profile_photo_url: Optional[str] = None

    model_config = {"from_attributes": True}


class PublicProfileResponse(BaseModel):
    """Schema for public profile response payload."""

    data: PublicProfileData
