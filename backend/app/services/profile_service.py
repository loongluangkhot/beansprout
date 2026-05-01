"""
Profile Service

This module provides profile management business logic.
"""

import logging
import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.profile import (
    ProfileUpdate,
    ProfileResponse,
    PublicProfileData,
    ReadingHistoryItem,
)
from app.utils.image_utils import (
    validate_image,
    get_image_extension,
    ImageValidationError,
    InvalidImageTypeError,
    ImageTooLargeError,
)

logger = logging.getLogger(__name__)


class ProfileServiceError(Exception):
    """Base exception for profile service errors."""

    def __init__(self, message: str, error_type: str = "profile_error"):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)


class ProfileNotFoundError(ProfileServiceError):
    """Raised when user profile is not found."""

    def __init__(self, user_id: UUID):
        super().__init__(
            message=f"Profile not found for user {user_id}",
            error_type="not_found"
        )
        self.user_id = user_id


class ProfileService:
    """
    Service class for profile management operations.

    This class encapsulates all profile-related business logic
    including retrieving and updating user profiles.
    """

    def __init__(self, db: AsyncSession):
        """
        Initialize the profile service with a database session.

        Args:
            db: SQLAlchemy async database session
        """
        self.db = db

    async def get_user_profile(self, user_id: UUID) -> ProfileResponse:
        """
        Retrieve the current user's profile.

        Args:
            user_id: The user's UUID

        Returns:
            ProfileResponse with profile data

        Raises:
            ProfileNotFoundError: If user is not found
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise ProfileNotFoundError(user_id)

        return ProfileResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            bio=user.bio,
            favorite_genres=user.favorite_genres,
            reading_history=user.reading_history,
            profile_photo_url=user.profile_photo_url,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

    async def get_public_profile(self, user_id: UUID) -> PublicProfileData:
        """
        Retrieve public profile fields for another user.
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise ProfileNotFoundError(user_id)

        return PublicProfileData(
            id=user.id,
            display_name=user.display_name,
            bio=user.bio,
            favorite_genres=user.favorite_genres,
            profile_photo_url=user.profile_photo_url,
        )

    async def update_user_profile(
        self,
        user_id: UUID,
        profile_data: ProfileUpdate
    ) -> ProfileResponse:
        """
        Update the current user's profile.

        Args:
            user_id: The user's UUID
            profile_data: ProfileUpdate schema with fields to update

        Returns:
            ProfileResponse with updated profile data

        Raises:
            ProfileNotFoundError: If user is not found
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise ProfileNotFoundError(user_id)

        # Update only provided fields
        update_data = profile_data.model_dump(exclude_unset=True)

        # Handle reading_history specially to convert to dicts
        if 'reading_history' in update_data and update_data['reading_history'] is not None:
            update_data['reading_history'] = [
                item.model_dump() if hasattr(item, 'model_dump') else item
                for item in update_data['reading_history']
            ]

        for field, value in update_data.items():
            if value is not None:
                setattr(user, field, value)

        await self.db.commit()
        await self.db.refresh(user)

        logger.info(f"Profile updated for user {user_id}")

        return ProfileResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            bio=user.bio,
            favorite_genres=user.favorite_genres,
            reading_history=user.reading_history,
            profile_photo_url=user.profile_photo_url,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

    # Storage configuration
    @staticmethod
    def _get_photo_storage_path() -> Path:
        """Get the base path for photo storage."""
        # Use environment variable or default to app directory
        upload_dir = os.getenv("PHOTO_UPLOAD_DIR", "backend/app/uploads/photos")
        return Path(upload_dir)

    @staticmethod
    def _get_photo_base_url() -> str:
        """Get the base URL for serving photos."""
        return os.getenv("PHOTO_BASE_URL", "/uploads/photos")

    async def upload_profile_photo(
        self,
        user_id: UUID,
        file_content: bytes,
        content_type: str
    ) -> ProfileResponse:
        """
        Upload a profile photo for the user.

        Args:
            user_id: The user's UUID
            file_content: The image file content as bytes
            content_type: The MIME type of the image

        Returns:
            ProfileResponse with updated profile data

        Raises:
            ProfileNotFoundError: If user is not found
            InvalidImageTypeError: If image type is not supported
            ImageTooLargeError: If image exceeds size limit
            ImageValidationError: If image data is invalid
        """
        # Validate image
        file_size = len(file_content)
        validate_image(content_type, file_size)

        # Get user
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise ProfileNotFoundError(user_id)

        # Delete existing photo if present
        if user.profile_photo_url:
            await self._delete_photo_file(user.profile_photo_url)

        # Generate unique filename
        extension = get_image_extension(content_type)
        filename = f"{user_id}{extension}"
        storage_path = self._get_photo_storage_path()

        # Ensure directory exists
        storage_path.mkdir(parents=True, exist_ok=True)

        # Save file
        file_path = storage_path / filename
        with open(file_path, "wb") as f:
            f.write(file_content)

        # Update user profile
        photo_url = f"{self._get_photo_base_url()}/{filename}"
        user.profile_photo_url = photo_url
        user.updated_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(user)

        logger.info(f"Profile photo uploaded for user {user_id}")

        return ProfileResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            bio=user.bio,
            favorite_genres=user.favorite_genres,
            reading_history=user.reading_history,
            profile_photo_url=user.profile_photo_url,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

    async def delete_profile_photo(self, user_id: UUID) -> ProfileResponse:
        """
        Delete the user's profile photo.

        Args:
            user_id: The user's UUID

        Returns:
            ProfileResponse with updated profile data

        Raises:
            ProfileNotFoundError: If user is not found
        """
        # Get user
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise ProfileNotFoundError(user_id)

        # Delete existing photo if present
        if user.profile_photo_url:
            await self._delete_photo_file(user.profile_photo_url)

        # Update user profile
        user.profile_photo_url = None
        user.updated_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(user)

        logger.info(f"Profile photo deleted for user {user_id}")

        return ProfileResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            bio=user.bio,
            favorite_genres=user.favorite_genres,
            reading_history=user.reading_history,
            profile_photo_url=user.profile_photo_url,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

    async def _delete_photo_file(self, photo_url: str) -> None:
        """
        Delete a photo file from storage.

        Args:
            photo_url: The URL of the photo to delete
        """
        try:
            # Extract filename from URL
            filename = photo_url.split("/")[-1]
            file_path = self._get_photo_storage_path() / filename

            if file_path.exists():
                file_path.unlink()
                logger.info(f"Deleted photo file: {filename}")
        except Exception as e:
            logger.warning(f"Failed to delete photo file: {e}")
