"""
Profile Endpoint Tests

This module contains unit tests for the profile management endpoints.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime

from app.schemas.profile import ProfileUpdate, ProfileResponse, ReadingHistoryItem
from app.services.profile_service import ProfileService, ProfileNotFoundError


class TestProfileUpdate:
    """Tests for ProfileUpdate schema validation."""

    def test_valid_profile_update(self):
        """Test creating a valid profile update."""
        data = ProfileUpdate(
            bio="Test bio",
            favorite_genres=["Mystery", "Sci-Fi"],
            reading_history=[
                ReadingHistoryItem(
                    title="The Great Gatsby",
                    author="F. Scott Fitzgerald",
                    completed_date="2025-01-15"
                )
            ]
        )
        assert data.bio == "Test bio"
        assert len(data.favorite_genres) == 2
        assert len(data.reading_history) == 1

    def test_bio_exceeds_limit(self):
        """Test that bio exceeding 500 characters fails validation."""
        with pytest.raises(ValueError, match="Bio must be 500 characters or less"):
            ProfileUpdate(bio="x" * 501)

    def test_too_many_genres(self):
        """Test that more than 5 genres fails validation."""
        with pytest.raises(ValueError, match="Maximum 5 genres allowed"):
            ProfileUpdate(favorite_genres=["Fiction", "Non-Fiction", "Mystery", "Sci-Fi", "Fantasy", "Romance"])

    def test_invalid_genre(self):
        """Test that invalid genre fails validation."""
        with pytest.raises(ValueError, match="Invalid genre"):
            ProfileUpdate(favorite_genres=["InvalidGenre"])

    def test_too_many_books_in_history(self):
        """Test that more than 20 books fails validation."""
        with pytest.raises(ValueError, match="Maximum 20 books"):
            books = [
                ReadingHistoryItem(title=f"Book {i}", author="Author")
                for i in range(21)
            ]
            ProfileUpdate(reading_history=books)

    def test_empty_update(self):
        """Test that empty update is valid."""
        data = ProfileUpdate()
        assert data.bio is None
        assert data.favorite_genres is None
        assert data.reading_history is None


class TestProfileResponse:
    """Tests for ProfileResponse schema."""

    def test_profile_response_creation(self):
        """Test creating a profile response."""
        user_id = uuid4()
        now = datetime.now()
        
        response = ProfileResponse(
            id=user_id,
            email="test@example.com",
            display_name="Test User",
            bio="Test bio",
            favorite_genres=["Mystery"],
            reading_history=[
                ReadingHistoryItem(
                    title="Book Title",
                    author="Author Name",
                    completed_date="2025-01-15"
                )
            ],
            profile_photo_url=None,
            created_at=now,
            updated_at=now
        )
        
        assert response.email == "test@example.com"
        assert response.display_name == "Test User"


class TestProfileService:
    """Tests for ProfileService business logic."""

    @pytest.mark.asyncio
    async def test_get_user_profile_success(self):
        """Test successful profile retrieval."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_user = MagicMock()
        mock_user.id = uuid4()
        mock_user.email = "test@example.com"
        mock_user.display_name = "Test User"
        mock_user.bio = "Test bio"
        mock_user.favorite_genres = ["Mystery"]
        mock_user.reading_history = []
        mock_user.profile_photo_url = None
        mock_user.created_at = datetime.now()
        mock_user.updated_at = datetime.now()
        
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result
        
        service = ProfileService(mock_db)
        result = await service.get_user_profile(mock_user.id)
        
        assert result.email == "test@example.com"
        assert result.bio == "Test bio"

    @pytest.mark.asyncio
    async def test_get_user_profile_not_found(self):
        """Test profile retrieval for non-existent user."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result
        
        service = ProfileService(mock_db)
        
        with pytest.raises(ProfileNotFoundError):
            await service.get_user_profile(uuid4())

    @pytest.mark.asyncio
    async def test_update_user_profile_success(self):
        """Test successful profile update."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_user = MagicMock()
        mock_user.id = uuid4()
        mock_user.email = "test@example.com"
        mock_user.display_name = "Test User"
        mock_user.bio = "Old bio"
        mock_user.favorite_genres = ["Mystery"]
        mock_user.reading_history = []
        mock_user.profile_photo_url = None
        mock_user.created_at = datetime.now()
        mock_user.updated_at = datetime.now()
        
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_db.execute.return_value = mock_result
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()
        
        service = ProfileService(mock_db)
        
        update_data = ProfileUpdate(bio="New bio")
        result = await service.update_user_profile(mock_user.id, update_data)
        
        assert result.bio == "New bio"
        mock_db.commit.assert_called_once()
