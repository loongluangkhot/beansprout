"""
Authentication Endpoints

This module defines the API endpoints for user authentication.
"""

import logging
import time
from collections import defaultdict
from threading import Lock

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, get_async_session_factory

logger = logging.getLogger(__name__)
from app.schemas.user import LoginRequest, LoginResponse, LogoutResponse, RegisterResponse, UserCreate
from app.services.auth_service import AuthService, EmailAlreadyExistsError, InvalidCredentialsError, PasswordValidationError

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Simple in-memory rate limiter for registration
# Note: For production, use Redis-based rate limiting
REGISTRATION_RATE_LIMIT = 5  # requests per window
REGISTRATION_WINDOW = 300  # 5 minutes in seconds
LOGIN_RATE_LIMIT = 5  # attempts per window
LOGIN_WINDOW = 300  # 5 minutes in seconds
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_rate_limit_lock = Lock()  # Thread lock for race condition prevention


def check_rate_limit(email: str) -> bool:
    """Check if email has exceeded registration rate limit."""
    current_time = time.time()
    window_start = current_time - REGISTRATION_WINDOW
    
    with _rate_limit_lock:
        # Clean old entries
        _rate_limit_store[email] = [
            t for t in _rate_limit_store[email] if t > window_start
        ]
        
        if len(_rate_limit_store[email]) >= REGISTRATION_RATE_LIMIT:
            return False
        
        _rate_limit_store[email].append(current_time)
        return True


def check_login_rate_limit(email: str) -> bool:
    """Check if email has exceeded login rate limit."""
    current_time = time.time()
    window_start = current_time - LOGIN_WINDOW
    
    with _rate_limit_lock:
        # Clean old entries
        _rate_limit_store[f"login:{email}"] = [
            t for t in _rate_limit_store[f"login:{email}"] if t > window_start
        ]
        
        if len(_rate_limit_store[f"login:{email}"]) >= LOGIN_RATE_LIMIT:
            return False
        
        _rate_limit_store[f"login:{email}"].append(current_time)
        return True


# Import get_db from database module (replaces local definition)
from app.core.database import get_db


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password. "
                "Returns user data and JWT access token.",
    responses={
        201: {
            "description": "User successfully registered",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "user": {
                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                "email": "user@example.com",
                                "created_at": "2026-04-03T00:00:00Z"
                            },
                            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "token_type": "bearer"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Validation error - password requirements not met",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "validation_error",
                            "title": "Bad Request",
                            "status": 400,
                            "detail": "Password must contain at least one letter and one number"
                        }
                    }
                }
            }
        },
        409: {
            "description": "Email already registered",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "email_exists",
                            "title": "Conflict",
                            "status": 409,
                            "detail": "Email 'user@example.com' is already registered"
                        }
                    }
                }
            }
        }
    }
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> JSONResponse:
    """
    Register a new user account.

    This endpoint creates a new user with the provided email and password.
    The password must meet security requirements:
    - At least 8 characters
    - At least one letter
    - At least one number

    On successful registration, an access token is returned which can be
    used for subsequent authenticated requests.
    """
    # Check rate limit before processing
    if not check_rate_limit(user_data.email):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": {
                    "type": "rate_limit_exceeded",
                    "title": "Too Many Requests",
                    "status": 429,
                    "detail": "Too many registration attempts. Please try again later."
                }
            }
        )
    
    auth_service = AuthService(db)

    try:
        result = await auth_service.register_user(user_data)

        # Return in data envelope format as per architecture
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "data": {
                    "user": result.user.model_dump(mode="json"),
                    "access_token": result.access_token,
                    "token_type": result.token_type
                }
            }
        )

    except EmailAlreadyExistsError as e:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": {
                    "type": e.error_type,
                    "title": "Conflict",
                    "status": 409,
                    "detail": e.message
                }
            }
        )

    except PasswordValidationError as e:
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


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login with email and password",
    description="Authenticate user with email and password. Returns JWT access token.",
    responses={
        200: {
            "description": "Login successful",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "user": {
                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                "email": "user@example.com",
                                "created_at": "2026-04-03T00:00:00Z"
                            },
                            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "token_type": "bearer"
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "invalid_credentials",
                            "title": "Unauthorized",
                            "status": 401,
                            "detail": "Invalid email or password"
                        }
                    }
                }
            }
        },
        429: {
            "description": "Too many login attempts",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "type": "rate_limit_exceeded",
                            "title": "Too Many Requests",
                            "status": 429,
                            "detail": "Too many login attempts. Please try again later."
                        }
                    }
                }
            }
        }
    }
)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> JSONResponse:
    """
    Login with email and password.

    This endpoint authenticates a user with their email and password.
    Returns an access token on successful authentication.
    Both "email not found" and "wrong password" return the same error
    message to prevent email enumeration attacks.
    """
    # Check rate limit before processing
    if not check_login_rate_limit(login_data.email):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": {
                    "type": "rate_limit_exceeded",
                    "title": "Too Many Requests",
                    "status": 429,
                    "detail": "Too many login attempts. Please try again later."
                }
            }
        )
    
    auth_service = AuthService(db)

    try:
        result = await auth_service.authenticate_user(login_data.email, login_data.password)

        if result is None:
            # Return generic error message to prevent enumeration
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": {
                        "type": "invalid_credentials",
                        "title": "Unauthorized",
                        "status": 401,
                        "detail": "Invalid email or password"
                    }
                }
            )

        # Return in data envelope format as per architecture
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "user": result.user.model_dump(mode="json"),
                    "access_token": result.access_token,
                    "token_type": result.token_type
                }
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "internal_error",
                    "title": "Internal Server Error",
                    "status": 500,
                    "detail": "An error occurred during authentication"
                }
            }
        )


@router.post(
    "/validate-session",
    summary="Validate session token",
    description="Verify if the provided JWT token is still valid",
    responses={
        200: {
            "description": "Session is valid",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "valid": True,
                            "user": {
                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                "email": "user@example.com"
                            }
                        }
                    }
                }
            }
        },
        401: {
            "description": "Session is invalid or expired",
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
async def validate_session(request: Request) -> JSONResponse:
    """
    Validate a JWT token and return user info if valid.
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Missing or invalid authorization header"
                }
            }
        )
    
    token = auth_header.split(" ")[1]
    
    from app.core.security import decode_access_token
    
    payload = decode_access_token(token)
    
    if not payload:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Token is invalid or expired"
                }
            }
        )
    
    # Get user from database to ensure they still exist
    from app.services.auth_service import AuthService
    from uuid import UUID
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Invalid token payload"
                }
            }
        )
    
    try:
        user_id = UUID(user_id_str)
    except (ValueError, TypeError):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Invalid token payload"
                }
            }
        )
    
    async_session_factory = get_async_session_factory()
    async with async_session_factory() as session:
        auth_service = AuthService(session)
        user = await auth_service.get_user_by_id(user_id)
        
        if not user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "error": {
                        "type": "invalid_token",
                        "title": "Unauthorized",
                        "status": 401,
                        "detail": "User no longer exists"
                    }
                }
            )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "data": {
                    "valid": True,
                    "user": {
                        "id": str(user.id),
                        "email": user.email
                    }
                }
            }
        )


@router.post(
    "/logout",
    summary="Logout user",
    description="Logout the current user by invalidating their JWT token",
    responses={
        200: {
            "description": "Logout successful",
            "content": {
                "application/json": {
                    "example": {
                        "data": {
                            "message": "Successfully logged out"
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
                            "detail": "Invalid or expired token"
                        }
                    }
                }
            }
        }
    }
)
async def logout(request: Request) -> JSONResponse:
    """
    Logout the current user.
    
    This endpoint invalidates the JWT token by adding it to the blocklist.
    After logout, the token cannot be used for authenticated requests.
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "type": "invalid_token",
                    "title": "Unauthorized",
                    "status": 401,
                    "detail": "Missing or invalid authorization header"
                }
            }
        )
    
    token = auth_header.split(" ")[1]
    
    # Decode token to get user info for audit log
    from app.core.security import decode_access_token
    user_info = "unknown"
    payload = decode_access_token(token)
    if payload:
        user_info = payload.get("email", "unknown")
    
    # Use auth service to logout (adds token to blocklist)
    auth_service = AuthService(None)
    await auth_service.logout(token)
    
    # Audit log the logout event
    logger.info(f"AUDIT: User logged out - email: {user_info}")
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "data": {
                "message": "Successfully logged out"
            }
        }
    )
