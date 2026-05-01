"""
Authentication Service

This module provides authentication business logic including
user registration and token generation.
"""

import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import add_to_blocklist, create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import RegisterResponse, UserCreate, UserResponse

logger = logging.getLogger(__name__)


class AuthServiceError(Exception):
    """Base exception for authentication service errors."""

    def __init__(self, message: str, error_type: str = "auth_error"):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)


class EmailAlreadyExistsError(AuthServiceError):
    """Raised when attempting to register with an existing email."""

    def __init__(self, email: str):
        super().__init__(
            message=f"Email '{email}' is already registered",
            error_type="email_exists"
        )
        self.email = email


class InvalidCredentialsError(AuthServiceError):
    """Raised when credentials are invalid."""

    def __init__(self):
        super().__init__(
            message="Invalid email or password",
            error_type="invalid_credentials"
        )


class PasswordValidationError(AuthServiceError):
    """Raised when password doesn't meet requirements."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            error_type="validation_error"
        )


class AuthService:
    """
    Service class for authentication operations.

    This class encapsulates all authentication-related business logic
    including user registration, login, and token management.
    """

    def __init__(self, db: AsyncSession | None = None):
        """
        Initialize the auth service with a database session.

        Args:
            db: SQLAlchemy async database session (optional for logout)
        """
        self.db = db

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Retrieve a user by email address.

        Args:
            email: The email address to search for

        Returns:
            User object if found, None otherwise
        """
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """
        Retrieve a user by their ID.

        Args:
            user_id: The user's UUID

        Returns:
            User object if found, None otherwise
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def register_user(self, user_data: UserCreate) -> RegisterResponse:
        """
        Register a new user account.

        Args:
            user_data: UserCreate schema with email and password

        Returns:
            RegisterResponse containing user data and access token

        Raises:
            EmailAlreadyExistsError: If email is already registered
            PasswordValidationError: If password doesn't meet requirements
        """
        # Check if email already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise EmailAlreadyExistsError(user_data.email)

        # Hash the password (Pydantic schema already validated password strength)
        password_hash = hash_password(user_data.password)

        # Create the new user
        new_user = User(
            email=user_data.email,
            password_hash=password_hash
        )

        await self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)

        # Create access token
        access_token = create_access_token(
            data={"sub": str(new_user.id), "email": new_user.email}
        )

        # Build response
        user_response = UserResponse(
            id=new_user.id,
            email=new_user.email,
            created_at=new_user.created_at
        )

        return RegisterResponse(
            user=user_response,
            access_token=access_token,
            token_type="bearer"
        )

    async def authenticate_user(self, email: str, password: str) -> RegisterResponse | None:
        """
        Authenticate a user with email and password.

        Args:
            email: User's email address
            password: User's plain text password

        Returns:
            RegisterResponse if authentication succeeds, None otherwise
        """
        user = await self.get_user_by_email(email)

        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        user_response = UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at
        )

        return RegisterResponse(
            user=user_response,
            access_token=access_token,
            token_type="bearer"
        )

    async def logout(self, token: str) -> bool:
        """
        Logout a user by invalidating their JWT token.
        
        Args:
            token: The JWT token to invalidate
            
        Returns:
            True if token was successfully added to blocklist
        """
        add_to_blocklist(token)
        logger.info("User logged out, token invalidated")
        return True

