"""
User Pydantic Schemas

This module defines Pydantic models for user-related request/response validation.
"""

import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    """Schema for user registration request."""

    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, password: str) -> str:
        """
        Validate password meets security requirements:
        - Minimum 8 characters
        - Contains at least one letter
        - Contains at least one number
        """
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if not re.search(r'[a-zA-Z]', password):
            raise ValueError("Password must contain at least one letter")

        if not re.search(r'[0-9]', password):
            raise ValueError("Password must contain at least one number")

        return password


class UserResponse(BaseModel):
    """Schema for user data in responses (excludes sensitive data)."""

    id: UUID
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserInDB(BaseModel):
    """Schema representing user data as stored in database."""

    id: UUID
    email: str
    password_hash: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str = "bearer"


class RegisterResponse(BaseModel):
    """Schema for successful registration response."""

    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    """Schema for user login request."""

    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password_not_empty(cls, password: str) -> str:
        """Validate password is not empty."""
        if not password or not password.strip():
            raise ValueError("Password cannot be empty")
        return password


class LoginResponse(BaseModel):
    """Schema for successful login response."""

    user: UserResponse
    access_token: str
    token_type: str = "bearer"
