"""
Security Utilities

This module provides password hashing and JWT token utilities.
"""

import logging
import re
from datetime import UTC, datetime, timedelta
from threading import Lock
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

logger = logging.getLogger(__name__)

# Configuration constants - load from settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Password context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Token blocklist for logout functionality
# In production, use Redis for distributed blocklist
_token_blocklist: dict[str, float] = {}  # token -> expiry timestamp
_blocklist_lock = Lock()


def add_to_blocklist(token: str) -> None:
    """
    Add a token to the blocklist.
    
    Args:
        token: The JWT token to invalidate
    """
    # Get token expiry from the token itself
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        if exp:
            with _blocklist_lock:
                _token_blocklist[token] = exp
            logger.info(f"Token added to blocklist, expires at {exp}")
            return
    except JWTError:
        pass
    
    # If we can't decode, add with default expiry (24 hours)
    with _blocklist_lock:
        _token_blocklist[token] = datetime.now(UTC).timestamp() + 86400


def is_token_blocked(token: str) -> bool:
    """
    Check if a token is in the blocklist.
    
    Args:
        token: The JWT token to check
        
    Returns:
        True if token is blocked, False otherwise
    """
    current_time = datetime.now(UTC).timestamp()
    
    with _blocklist_lock:
        # Clean expired entries
        expired_tokens = [
            t for t, exp_time in _token_blocklist.items() 
            if exp_time < current_time
        ]
        for t in expired_tokens:
            del _token_blocklist[t]
        
        return token in _token_blocklist


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Note: passlib's bcrypt implementation uses constant-time comparison
    internally to prevent timing attacks. This is the recommended approach
    for password verification.

    Args:
        plain_password: The plain text password to verify
        hashed_password: The bcrypt hashed password

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: The plain text password to hash

    Returns:
        The bcrypt hashed password
    """
    return pwd_context.hash(password)


def validate_password_strength(password: str) -> tuple[bool, str | None]:
    """
    Validate password meets security requirements.

    Requirements:
    - Minimum 8 characters
    - Contains at least one letter
    - Contains at least one number

    Args:
        password: The password to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r'[a-zA-Z]', password):
        return False, "Password must contain at least one letter"

    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"

    return True, None


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary containing claims to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict | None:
    """
    Decode and validate a JWT access token.
    
    Also checks if token is in the blocklist (logged out).

    Args:
        token: The JWT token string to decode

    Returns:
        Decoded token payload or None if invalid
    """
    # Check if token is blocked first
    if is_token_blocked(token):
        return None
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
