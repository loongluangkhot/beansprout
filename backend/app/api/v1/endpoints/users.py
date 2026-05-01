"""
User Profile Endpoints

This module defines the API endpoints for user profile management.
"""

import logging
import time
from collections import defaultdict
from threading import Lock
from uuid import UUID

from fastapi import APIRouter, Depends, Request, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.profile import ProfileUpdate, ProfileResponse, PublicProfileResponse
from app.services.profile_service import ProfileService, ProfileNotFoundError
from app.utils.image_utils import (
    InvalidImageTypeError,
    ImageTooLargeError,
    ImageValidationError,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])

# Rate limiting configuration
PHOTO_UPLOAD_RATE_LIMIT = 10  # Max uploads per window
PHOTO_UPLOAD_RATE_WINDOW = 60  # Window in seconds

# Simple in-memory rate limiter for photo uploads
_photo_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_photo_rate_limit_lock = Lock()


def check_photo_upload_rate_limit(user_id: str) -> bool:
    """
    Check if user has exceeded photo upload rate limit.
    
    Args:
        user_id: The user's ID to check
        
    Returns:
        True if within limit, False if exceeded
    """
    current_time = time.time()
    window_start = current_time - PHOTO_UPLOAD_RATE_WINDOW
    
    with _photo_rate_limit_lock:
        # Clean old entries
        _photo_rate_limit_store[user_id] = [
            t for t in _photo_rate_limit_store[user_id] if t > window_start
        ]
        
        # Check limit
        if len(_photo_rate_limit_store[user_id]) >= PHOTO_UPLOAD_RATE_LIMIT:
            return False
        
        # Add current request
        _photo_rate_limit_store[user_id].append(current_time)
        return True


def get_current_user_id(request: Request) -> UUID:
    """
    Extract and validate user ID from JWT token in request.
    
    Args:
        request: FastAPI request object
        
    Returns:
        User ID from token
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    from app.core.security import decode_access_token
    from fastapi import HTTPException
    
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Missing or invalid authorization header"
                }
            }
        )
    
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Token is invalid or expired"
                }
            }
        )
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Invalid token payload"
                }
            }
        )
    
    try:
        return UUID(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Invalid token payload"
                }
            }
        )


@router.get(
    "/{user_id}/profile",
    response_model=PublicProfileResponse,
    summary="Get public user profile",
    description="Retrieve public profile details for a user by ID.",
)
async def get_public_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    profile_service = ProfileService(db)

    try:
        profile = await profile_service.get_public_profile(user_id)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"data": profile.model_dump(mode="json")},
        )
    except ProfileNotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Not Found",
                "status": 404,
                "detail": e.message,
            },
        )
    except Exception as e:
        logger.error(f"Error getting public profile: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "An error occurred while retrieving public profile",
            },
        )


@router.get(
    "/me",
    response_model=ProfileResponse,
    summary="Get current user profile",
    description="Retrieve the profile of the currently authenticated user",
    responses={
        200: {
            "description": "Profile retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "user@example.com",
                            "display_name": "John Doe",
                            "bio": "I love reading mystery novels...",
                            "favorite_genres": ["Mystery", "Sci-Fi", "Historical"],
                            "reading_history": [
                                {
                                    "title": "The Great Gatsby",
                                    "author": "F. Scott Fitzgerald",
                                    "completed_date": "2025-01-15"
                                }
                            ],
                            "profile_photo_url": None,
                            "created_at": "2025-01-01T00:00:00Z",
                            "updated_at": "2025-03-15T00:00:00Z"
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid or missing token",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "invalid_token",
                            "title": "Unauthorized",
                            "status": 401,
                            "detail": "Token is invalid or expired"
                        }
                    }
                }
            }
        }
    }
)
async def get_profile(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> JSONResponse:
    """
    Get the current user's profile.
    
    Returns the profile information including bio, favorite genres,
    and reading history for the authenticated user.
    """
    # Get user ID from token
    user_id = get_current_user_id(request)
    
    profile_service = ProfileService(db)
    
    try:
        profile = await profile_service.get_user_profile(user_id)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": profile.model_dump(mode="json")
            }
        )
        
    except ProfileNotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Not Found",
                    "status": 404,
                    "detail": e.message
                }
            }
        )
    
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "internal_error",
                    "title": "Internal Server Error",
                    "status": 500,
                    "detail": "An error occurred while retrieving profile"
                }
            }
        )


@router.patch(
    "/me",
    response_model=ProfileResponse,
    summary="Update current user profile",
    description="Update the profile of the currently authenticated user",
    responses={
        200: {
            "description": "Profile updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "user@example.com",
                            "display_name": "John Doe",
                            "bio": "Updated bio text...",
                            "favorite_genres": ["Mystery", "Sci-Fi"],
                            "reading_history": [
                                {
                                    "title": "The Great Gatsby",
                                    "author": "F. Scott Fitzgerald",
                                    "completed_date": "2025-01-15"
                                }
                            ],
                            "profile_photo_url": None,
                            "created_at": "2025-01-01T00:00:00Z",
                            "updated_at": "2026-04-05T12:00:00Z"
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid or missing token",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "invalid_token",
                            "title": "Unauthorized",
                            "status": 401,
                            "detail": "Token is invalid or expired"
                        }
                    }
                }
            }
        },
        422: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "validation_error",
                            "title": "Validation Error",
                            "status": 422,
                            "detail": "Bio must be 500 characters or less"
                        }
                    }
                }
            }
        }
    }
)
async def update_profile(
    request: Request,
    profile_data: ProfileUpdate,
    db: AsyncSession = Depends(get_db)
) -> JSONResponse:
    """
    Update the current user's profile.
    
    Allows updating bio, favorite genres, and reading history.
    All fields are optional - only provided fields will be updated.
    """
    # Get user ID from token
    user_id = get_current_user_id(request)
    
    # Log profile update attempt for audit
    logger.info(f"AUDIT: Profile update attempt for user {user_id}")
    
    profile_service = ProfileService(db)
    
    try:
        profile = await profile_service.update_user_profile(user_id, profile_data)
        
        logger.info(f"AUDIT: Profile updated successfully for user {user_id}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": profile.model_dump(mode="json")
            }
        )
        
    except ProfileNotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Not Found",
                    "status": 404,
                    "detail": e.message
                }
            }
        )
    
    except ValueError as e:
        # Validation errors from Pydantic
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "type": "validation_error",
                    "title": "Validation Error",
                    "status": 422,
                    "detail": str(e)
                }
            }
        )
    
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "internal_error",
                    "title": "Internal Server Error",
                    "status": 500,
                    "detail": "An error occurred while updating profile"
                }
            }
        )


@router.post(
    "/me/photo",
    response_model=ProfileResponse,
    summary="Upload profile photo",
    description="Upload a profile photo for the authenticated user",
    responses={
        200: {
            "description": "Photo uploaded successfully",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "user@example.com",
                            "display_name": "John Doe",
                            "bio": "I love reading mystery novels...",
                            "favorite_genres": ["Mystery", "Sci-Fi"],
                            "reading_history": [],
                            "profile_photo_url": "/uploads/photos/550e8400-e29b-41d4-a716-446655440000.jpg",
                            "created_at": "2025-01-01T00:00:00Z",
                            "updated_at": "2026-04-05T12:00:00Z"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Invalid file type",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "invalid_file_type",
                            "title": "Bad Request",
                            "status": 400,
                            "detail": "Invalid image type: application/pdf. Only JPEG and PNG are supported."
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid or missing token",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "invalid_token",
                            "title": "Unauthorized",
                            "status": 401,
                            "detail": "Token is invalid or expired"
                        }
                    }
                }
            }
        },
        413: {
            "description": "File too large",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "file_too_large",
                            "title": "Payload Too Large",
                            "status": 413,
                            "detail": "Image size 10485760 bytes exceeds maximum allowed size of 5242880 bytes (5MB)."
                        }
                    }
                }
            }
        }
    }
)
async def upload_profile_photo(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
) -> JSONResponse:
    """
    Upload a profile photo for the current user.

    Accepts JPEG and PNG images up to 5MB.
    """
    # Get user ID from token
    user_id = get_current_user_id(request)

    # Check rate limit before processing
    if not check_photo_upload_rate_limit(str(user_id)):
        logger.warning(f"RATE LIMIT: Photo upload rate limit exceeded for user {user_id}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": {
                    "type": "rate_limit_exceeded",
                    "title": "Too Many Requests",
                    "status": 429,
                    "detail": f"Photo upload rate limit exceeded. Maximum {PHOTO_UPLOAD_RATE_LIMIT} uploads per {PHOTO_UPLOAD_RATE_WINDOW} seconds."
                }
            }
        )

    # Log photo upload attempt for audit
    logger.info(f"AUDIT: Profile photo upload attempt for user {user_id}")

    # Validate file is provided
    if not file:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "type": "invalid_request",
                    "title": "Bad Request",
                    "status": 400,
                    "detail": "No file provided"
                }
            }
        )

    # Get content type
    content_type = file.content_type
    if not content_type:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "type": "invalid_file_type",
                    "title": "Bad Request",
                    "status": 400,
                    "detail": "Could not determine file type"
                }
            }
        )

    # Read file content
    try:
        file_content = await file.read()
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "type": "invalid_request",
                    "title": "Bad Request",
                    "status": 400,
                    "detail": "Could not read file"
                }
            }
        )

    profile_service = ProfileService(db)

    try:
        profile = await profile_service.upload_profile_photo(
            user_id=user_id,
            file_content=file_content,
            content_type=content_type
        )

        logger.info(f"AUDIT: Profile photo uploaded successfully for user {user_id}")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": profile.model_dump(mode="json")
            }
        )

    except InvalidImageTypeError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Bad Request",
                    "status": 400,
                    "detail": e.message
                }
            }
        )

    except ImageTooLargeError as e:
        return JSONResponse(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Payload Too Large",
                    "status": 413,
                    "detail": e.message
                }
            }
        )

    except ImageValidationError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Bad Request",
                    "status": 400,
                    "detail": e.message
                }
            }
        )

    except ProfileNotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Not Found",
                    "status": 404,
                    "detail": e.message
                }
            }
        )

    except Exception as e:
        logger.error(f"Error uploading profile photo: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "internal_error",
                    "title": "Internal Server Error",
                    "status": 500,
                    "detail": "An error occurred while uploading profile photo"
                }
            }
        )


@router.delete(
    "/me/photo",
    response_model=ProfileResponse,
    summary="Delete profile photo",
    description="Delete the profile photo for the authenticated user",
    responses={
        200: {
            "description": "Photo deleted successfully",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "user@example.com",
                            "display_name": "John Doe",
                            "bio": "I love reading mystery novels...",
                            "favorite_genres": ["Mystery", "Sci-Fi"],
                            "reading_history": [],
                            "profile_photo_url": None,
                            "created_at": "2025-01-01T00:00:00Z",
                            "updated_at": "2026-04-05T12:00:00Z"
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid or missing token",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "invalid_token",
                            "title": "Unauthorized",
                            "status": 401,
                            "detail": "Token is invalid or expired"
                        }
                    }
                }
            }
        }
    }
)
async def delete_profile_photo(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> JSONResponse:
    """
    Delete the profile photo for the current user.

    Resets the profile to use the default avatar.
    """
    # Get user ID from token
    user_id = get_current_user_id(request)

    # Log photo delete attempt for audit
    logger.info(f"AUDIT: Profile photo delete attempt for user {user_id}")

    profile_service = ProfileService(db)

    try:
        profile = await profile_service.delete_profile_photo(user_id)

        logger.info(f"AUDIT: Profile photo deleted successfully for user {user_id}")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": profile.model_dump(mode="json")
            }
        )

    except ProfileNotFoundError as e:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Not Found",
                    "status": 404,
                    "detail": e.message
                }
            }
        )

    except Exception as e:
        logger.error(f"Error deleting profile photo: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "internal_error",
                    "title": "Internal Server Error",
                    "status": 500,
                    "detail": "An error occurred while deleting profile photo"
                }
            }
        )
