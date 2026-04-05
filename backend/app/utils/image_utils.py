"""
Image Utilities

This module provides image validation and processing helpers.
"""

import logging
from enum import Enum
from io import BytesIO
from typing import Optional, Tuple

from PIL import Image

logger = logging.getLogger(__name__)


class ImageType(str, Enum):
    """Supported image types."""
    JPEG = "image/jpeg"
    PNG = "image/png"


class ImageValidationError(Exception):
    """Base exception for image validation errors."""

    def __init__(
        self,
        message: str,
        error_type: str = "invalid_image",
        status_code: int = 400
    ):
        self.message = message
        self.error_type = error_type
        self.status_code = status_code
        super().__init__(self.message)


class InvalidImageTypeError(ImageValidationError):
    """Raised when image type is not supported."""

    def __init__(self, content_type: str):
        super().__init__(
            message=f"Invalid image type: {content_type}. Only JPEG and PNG are supported.",
            error_type="invalid_file_type",
            status_code=400
        )
        self.content_type = content_type


class ImageTooLargeError(ImageValidationError):
    """Raised when image exceeds size limit."""

    def __init__(self, size: int, max_size: int):
        super().__init__(
            message=f"Image size {size} bytes exceeds maximum allowed size of {max_size} bytes (5MB).",
            error_type="file_too_large",
            status_code=413
        )
        self.size = size
        self.max_size = max_size


# Maximum file size: 5MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5,242,880 bytes

# Supported content types
SUPPORTED_CONTENT_TYPES = {ImageType.JPEG.value, ImageType.PNG.value}

# Supported extensions
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def validate_image_type(content_type: str) -> None:
    """
    Validate that the content type is a supported image type.

    Args:
        content_type: The MIME type of the uploaded file

    Raises:
        InvalidImageTypeError: If content type is not supported
    """
    if content_type.lower() not in SUPPORTED_CONTENT_TYPES:
        raise InvalidImageTypeError(content_type)


def validate_image_size(file_size: int) -> None:
    """
    Validate that the image file size is within limits.

    Args:
        file_size: The size of the uploaded file in bytes

    Raises:
        ImageTooLargeError: If file size exceeds 5MB
    """
    if file_size > MAX_IMAGE_SIZE:
        raise ImageTooLargeError(file_size, MAX_IMAGE_SIZE)


def validate_image(content_type: str, file_size: int) -> None:
    """
    Validate image type and size.

    Args:
        content_type: The MIME type of the uploaded file
        file_size: The size of the uploaded file in bytes

    Raises:
        InvalidImageTypeError: If content type is not supported
        ImageTooLargeError: If file size exceeds 5MB
    """
    validate_image_type(content_type)
    validate_image_size(file_size)


def get_image_extension(content_type: str) -> str:
    """
    Get the file extension for an image content type.

    Args:
        content_type: The MIME type of the image

    Returns:
        The file extension including the dot (e.g., '.jpg', '.png')
    """
    if content_type == ImageType.JPEG.value:
        return ".jpg"
    elif content_type == ImageType.PNG.value:
        return ".png"
    return ".jpg"  # Default to jpg


def get_image_dimensions(image_data: bytes) -> Optional[Tuple[int, int]]:
    """
    Get the dimensions of an image without fully loading it.

    Args:
        image_data: The image file data as bytes

    Returns:
        Tuple of (width, height) or None if unable to read
    """
    try:
        with Image.open(BytesIO(image_data)) as img:
            return img.size
    except Exception as e:
        logger.warning(f"Unable to read image dimensions: {e}")
        return None


def validate_image_content(image_data: bytes) -> None:
    """
    Validate that the image data is actually a valid image.

    Args:
        image_data: The image file data as bytes

    Raises:
        ImageValidationError: If the image data is invalid
    """
    try:
        with Image.open(BytesIO(image_data)) as img:
            # Verify we can actually open the image
            img.verify()
    except Exception as e:
        raise ImageValidationError(
            message=f"Invalid image data: {str(e)}",
            error_type="invalid_image",
            status_code=400
        )