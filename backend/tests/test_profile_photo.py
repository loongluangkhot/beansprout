"""
Profile Photo Tests

Tests for profile photo upload and delete endpoints.
"""

import io
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import status
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.schemas.profile import ProfileResponse


# Test constants
TEST_USER_ID = uuid.uuid4()
VALID_JPEG_CONTENT = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
VALID_PNG_CONTENT = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde"
INVALID_FILE_CONTENT = b"This is not an image"


def create_test_token(user_id: uuid.UUID) -> str:
    """Create a valid JWT token for testing."""
    from app.core.security import create_access_token
    
    return create_access_token(data={"sub": str(user_id)})


class TestProfilePhotoUpload:
    """Tests for POST /users/me/photo endpoint."""

    @pytest.fixture
    def auth_headers(self):
        """Create authorization headers with valid token."""
        token = create_test_token(TEST_USER_ID)
        return {"Authorization": f"Bearer {token}"}

    @pytest.mark.asyncio
    async def test_upload_photo_without_auth(self):
        """Test that上传照片需要认证。"""
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/users/me/photo",
                files={"file": ("test.jpg", VALID_JPEG_CONTENT, "image/jpeg")}
            )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_upload_photo_with_invalid_token(self, auth_headers):
        """Test that invalid token is rejected."""
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/users/me/photo",
                headers=invalid_headers,
                files={"file": ("test.jpg", VALID_JPEG_CONTENT, "image/jpeg")}
            )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_upload_photo_invalid_file_type(self, auth_headers):
        """Test that non-image files are rejected."""
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/users/me/photo",
                headers=auth_headers,
                files={"file": ("test.pdf", INVALID_FILE_CONTENT, "application/pdf")}
            )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "invalid_file_type" in response.json()["error"]["type"]

    @pytest.mark.asyncio
    async def test_upload_photo_file_too_large(self, auth_headers):
        """Test that files over 5MB are rejected."""
        # Create content larger than 5MB
        large_content = b"x" * (6 * 1024 * 1024)
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.post(
                "/api/v1/users/me/photo",
                headers=auth_headers,
                files={"file": ("large.jpg", large_content, "image/jpeg")}
            )
        
        assert response.status_code == status.HTTP_413_CONTENT_TOO_LARGE
        assert "file_too_large" in response.json()["error"]["type"]

    @pytest.mark.asyncio
    async def test_upload_photo_jpeg_success(self, auth_headers):
        """Test successful JPEG photo upload."""
        with patch("app.services.profile_service.ProfileService.upload_profile_photo") as mock_upload:
            mock_upload.return_value = ProfileResponse(
                id=TEST_USER_ID,
                email="test@example.com",
                display_name="Test User",
                bio=None,
                favorite_genres=None,
                reading_history=None,
                profile_photo_url="/uploads/photos/test.jpg",
                created_at="2025-01-01T00:00:00Z",
                updated_at="2026-04-05T12:00:00Z"
            )
            
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/users/me/photo",
                    headers=auth_headers,
                    files={"file": ("test.jpg", VALID_JPEG_CONTENT, "image/jpeg")}
                )
            
            assert response.status_code == status.HTTP_200_OK
            assert "data" in response.json()
            assert response.json()["data"]["profile_photo_url"] == "/uploads/photos/test.jpg"

    @pytest.mark.asyncio
    async def test_upload_photo_png_success(self, auth_headers):
        """Test successful PNG photo upload."""
        with patch("app.services.profile_service.ProfileService.upload_profile_photo") as mock_upload:
            mock_upload.return_value = ProfileResponse(
                id=TEST_USER_ID,
                email="test@example.com",
                display_name="Test User",
                bio=None,
                favorite_genres=None,
                reading_history=None,
                profile_photo_url="/uploads/photos/test.png",
                created_at="2025-01-01T00:00:00Z",
                updated_at="2026-04-05T12:00:00Z"
            )
            
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test"
            ) as client:
                response = await client.post(
                    "/api/v1/users/me/photo",
                    headers=auth_headers,
                    files={"file": ("test.png", VALID_PNG_CONTENT, "image/png")}
                )
            
            assert response.status_code == status.HTTP_200_OK
            assert "data" in response.json()
            assert response.json()["data"]["profile_photo_url"] == "/uploads/photos/test.png"


class TestProfilePhotoDelete:
    """Tests for DELETE /users/me/photo endpoint."""

    @pytest.fixture
    def auth_headers(self):
        """Create authorization headers with valid token."""
        token = create_test_token(TEST_USER_ID)
        return {"Authorization": f"Bearer {token}"}

    @pytest.mark.asyncio
    async def test_delete_photo_without_auth(self):
        """Test that删除照片需要认证。"""
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.delete("/api/v1/users/me/photo")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_delete_photo_with_invalid_token(self, auth_headers):
        """Test that invalid token is rejected."""
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test"
        ) as client:
            response = await client.delete(
                "/api/v1/users/me/photo",
                headers=invalid_headers
            )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.asyncio
    async def test_delete_photo_success(self, auth_headers):
        """Test successful photo deletion."""
        with patch("app.services.profile_service.ProfileService.delete_profile_photo") as mock_delete:
            mock_delete.return_value = ProfileResponse(
                id=TEST_USER_ID,
                email="test@example.com",
                display_name="Test User",
                bio=None,
                favorite_genres=None,
                reading_history=None,
                profile_photo_url=None,
                created_at="2025-01-01T00:00:00Z",
                updated_at="2026-04-05T12:00:00Z"
            )
            
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test"
            ) as client:
                response = await client.delete(
                    "/api/v1/users/me/photo",
                    headers=auth_headers
                )
            
            assert response.status_code == status.HTTP_200_OK
            assert "data" in response.json()
            assert response.json()["data"]["profile_photo_url"] is None


class TestImageValidation:
    """Tests for image validation utilities."""

    def test_validate_image_type_jpeg(self):
        """Test that JPEG is accepted."""
        from app.utils.image_utils import validate_image_type, InvalidImageTypeError
        
        # Should not raise
        validate_image_type("image/jpeg")

    def test_validate_image_type_png(self):
        """Test that PNG is accepted."""
        from app.utils.image_utils import validate_image_type, InvalidImageTypeError
        
        # Should not raise
        validate_image_type("image/png")

    def test_validate_image_type_invalid(self):
        """Test that invalid types are rejected."""
        from app.utils.image_utils import validate_image_type, InvalidImageTypeError
        
        with pytest.raises(InvalidImageTypeError) as exc_info:
            validate_image_type("application/pdf")
        
        assert exc_info.value.status_code == 400

    def test_validate_image_size_valid(self):
        """Test that valid size is accepted."""
        from app.utils.image_utils import validate_image_size
        
        # 1MB should be fine
        validate_image_size(1024 * 1024)

    def test_validate_image_size_too_large(self):
        """Test that oversized files are rejected."""
        from app.utils.image_utils import validate_image_size, ImageTooLargeError
        
        with pytest.raises(ImageTooLargeError) as exc_info:
            validate_image_size(6 * 1024 * 1024)
        
        assert exc_info.value.status_code == 413

    def test_get_image_extension_jpeg(self):
        """Test JPEG extension detection."""
        from app.utils.image_utils import get_image_extension
        
        assert get_image_extension("image/jpeg") == ".jpg"

    def test_get_image_extension_png(self):
        """Test PNG extension detection."""
        from app.utils.image_utils import get_image_extension
        
        assert get_image_extension("image/png") == ".png"
