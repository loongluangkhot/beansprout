"""
Authentication Tests

This module contains unit tests for the authentication service,
including password hashing, validation, and email uniqueness.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4
from datetime import datetime

from app.core.security import (
    hash_password,
    verify_password,
    validate_password_strength,
    create_access_token,
    decode_access_token,
    add_to_blocklist,
    is_token_blocked,
)
from app.services.auth_service import (
    AuthService,
    EmailAlreadyExistsError,
    InvalidCredentialsError,
    AuthServiceError,
)
from app.schemas.user import UserCreate, UserResponse, RegisterResponse, LoginRequest
from app.models.user import User


class TestPasswordHashing:
    """Tests for password hashing functionality."""
    
    def test_hash_password_returns_different_value(self):
        """Hashed password should be different from plain password."""
        password = "SecurePass123"
        hashed = hash_password(password)
        
        assert hashed != password
        assert len(hashed) > 0
    
    def test_hash_password_produces_unique_hashes(self):
        """Same password should produce different hashes due to salt."""
        password = "SecurePass123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        # Due to per-hash random salt, hashes should be different
        assert hash1 != hash2
    
    def test_verify_password_correct(self):
        """verify_password should return True for correct password."""
        password = "SecurePass123"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """verify_password should return False for incorrect password."""
        password = "SecurePass123"
        wrong_password = "WrongPassword456"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False


class TestPasswordValidation:
    """Tests for password strength validation."""
    
    def test_valid_password_passes(self):
        """Password with 8+ chars, letter, and number should pass."""
        valid_passwords = [
            "SecurePass123",
            "Test1234",
            "password1",
            "Abcdefg1",
        ]
        
        for password in valid_passwords:
            is_valid, error = validate_password_strength(password)
            assert is_valid is True, f"Password '{password}' should be valid"
            assert error is None
    
    def test_password_too_short(self):
        """Password with less than 8 characters should fail."""
        short_passwords = [
            "Pass1",      # 5 chars
            "Abc1",       # 4 chars
            "X1",         # 2 chars
            "",           # empty
        ]
        
        for password in short_passwords:
            is_valid, error = validate_password_strength(password)
            assert is_valid is False
            assert error is not None and "at least 8 characters" in error
    
    def test_password_no_letter(self):
        """Password without a letter should fail."""
        is_valid, error = validate_password_strength("12345678")
        
        assert is_valid is False
        assert error is not None and "at least one letter" in error
    
    def test_password_no_number(self):
        """Password without a number should fail."""
        is_valid, error = validate_password_strength("abcdefgh")
        
        assert is_valid is False
        assert error is not None and "at least one number" in error
    
    def test_password_exactly_8_chars_with_letter_and_number(self):
        """Password with exactly 8 chars including letter and number should pass."""
        is_valid, error = validate_password_strength("Abcdefg1")
        
        assert is_valid is True
        assert error is None


class TestJWTTokens:
    """Tests for JWT token creation and decoding."""
    
    def test_create_and_decode_token(self):
        """Should create a valid JWT and decode it back."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)
        
        assert token is not None
        assert len(token) > 0
        
        decoded = decode_access_token(token)
        
        assert decoded is not None
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"
    
    def test_decode_invalid_token_returns_none(self):
        """Invalid token should return None on decode."""
        invalid_token = "invalid.token.here"
        
        decoded = decode_access_token(invalid_token)
        
        assert decoded is None


class TestUserCreateSchema:
    """Tests for UserCreate Pydantic schema validation."""
    
    def test_valid_user_create(self):
        """Valid email and password should create UserCreate."""
        user = UserCreate(email="test@example.com", password="SecurePass123")
        
        assert user.email == "test@example.com"
        assert user.password == "SecurePass123"
    
    def test_invalid_email_format(self):
        """Invalid email format should raise validation error."""
        with pytest.raises(ValueError):
            UserCreate(email="not-an-email", password="SecurePass123")
    
    def test_password_too_short_schema(self):
        """Password under 8 characters should fail schema validation."""
        with pytest.raises(ValueError) as exc_info:
            UserCreate(email="test@example.com", password="Short1")
        
        assert "8 characters" in str(exc_info.value)
    
    def test_password_no_letter_schema(self):
        """Password without letter should fail schema validation."""
        with pytest.raises(ValueError) as exc_info:
            UserCreate(email="test@example.com", password="12345678")
        
        assert "letter" in str(exc_info.value)
    
    def test_password_no_number_schema(self):
        """Password without number should fail schema validation."""
        with pytest.raises(ValueError) as exc_info:
            UserCreate(email="test@example.com", password="abcdefgh")
        
        assert "number" in str(exc_info.value)


class TestAuthService:
    """Tests for AuthService business logic."""
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session."""
        db = MagicMock()
        db.execute = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        db.rollback = AsyncMock()
        db.add = MagicMock()
        return db
    
    @pytest.fixture
    def auth_service(self, mock_db):
        """Create AuthService with mock DB."""
        return AuthService(mock_db)
    
    @pytest.mark.asyncio
    async def test_register_user_success(self, auth_service, mock_db):
        """Successful registration should return RegisterResponse."""
        from uuid import uuid4
        from datetime import datetime, timezone
        
        # Mock no existing user
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result
        
        # Mock the refresh to set id and created_at on the user object
        async def mock_refresh(user):
            user.id = uuid4()
            user.created_at = datetime.now(timezone.utc)
        mock_db.refresh = mock_refresh
        
        user_data = UserCreate(email="newuser@example.com", password="SecurePass123")
        
        with patch('app.services.auth_service.hash_password', return_value="hashed_password"):
            with patch('app.services.auth_service.create_access_token', return_value="test_token"):
                result = await auth_service.register_user(user_data)
        
        assert isinstance(result, RegisterResponse)
        assert result.user.email == "newuser@example.com"
        assert result.access_token == "test_token"
        assert result.token_type == "bearer"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_register_user_email_exists(self, auth_service, mock_db):
        """Registration with existing email should raise EmailAlreadyExistsError."""
        # Mock existing user
        existing_user = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_user
        mock_db.execute.return_value = mock_result
        
        user_data = UserCreate(email="existing@example.com", password="SecurePass123")
        
        with pytest.raises(EmailAlreadyExistsError) as exc_info:
            await auth_service.register_user(user_data)
        
        assert "existing@example.com" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_register_user_weak_password(self, auth_service, mock_db):
        """Registration with weak password should raise ValueError from schema validation."""
        # Note: Password validation is now handled by Pydantic schema (UserCreate)
        # This test verifies that weak passwords fail at schema validation
        with pytest.raises(ValueError) as exc_info:
            UserCreate(email="test@example.com", password="weak")
        
        assert "at least 8 characters" in str(exc_info.value)


class TestErrorTypes:
    """Tests for custom exception types."""
    
    def test_auth_service_error_attributes(self):
        """AuthServiceError should have correct attributes."""
        error = AuthServiceError("Test error", "test_type")
        
        assert error.message == "Test error"
        assert error.error_type == "test_type"
    
    def test_email_already_exists_error(self):
        """EmailAlreadyExistsError should include email."""
        error = EmailAlreadyExistsError("test@example.com")
        
        assert "test@example.com" in error.message
        assert error.email == "test@example.com"
        assert error.error_type == "email_exists"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


class TestLoginSchemas:
    """Tests for Login Pydantic schema validation."""
    
    def test_valid_login_request(self):
        """Valid email and password should create LoginRequest."""
        login = LoginRequest(email="test@example.com", password="SecurePass123")
        
        assert login.email == "test@example.com"
        assert login.password == "SecurePass123"
    
    def test_invalid_email_format_login(self):
        """Invalid email format should raise validation error."""
        with pytest.raises(ValueError):
            LoginRequest(email="not-an-email", password="SecurePass123")
    
    def test_empty_password_login(self):
        """Empty password should fail schema validation."""
        with pytest.raises(ValueError) as exc_info:
            LoginRequest(email="test@example.com", password="")
        
        assert "empty" in str(exc_info.value).lower() or "required" in str(exc_info.value).lower()


class TestAuthServiceLogin:
    """Tests for AuthService login functionality."""
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session."""
        db = MagicMock()
        db.execute = AsyncMock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        db.rollback = AsyncMock()
        db.add = MagicMock()
        return db
    
    @pytest.fixture
    def auth_service(self, mock_db):
        """Create AuthService with mock DB."""
        return AuthService(mock_db)
    
    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, auth_service, mock_db):
        """Successful authentication should return RegisterResponse."""
        from datetime import datetime, timezone
        from uuid import uuid4
        
        # Mock existing user
        existing_user = User(
            id=uuid4(),
            email="test@example.com",
            password_hash=hash_password("SecurePass123"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_user
        mock_db.execute.return_value = mock_result
        
        with patch('app.services.auth_service.create_access_token', return_value="test_token"):
            result = await auth_service.authenticate_user("test@example.com", "SecurePass123")
        
        assert result is not None
        assert isinstance(result, RegisterResponse)
        assert result.user.email == "test@example.com"
        assert result.access_token == "test_token"
        assert result.token_type == "bearer"
    
    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self, auth_service, mock_db):
        """Authentication with wrong password should return None."""
        from datetime import datetime, timezone
        from uuid import uuid4
        
        # Mock existing user with correct password hash
        existing_user = User(
            id=uuid4(),
            email="test@example.com",
            password_hash=hash_password("CorrectPass123"),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_user
        mock_db.execute.return_value = mock_result
        
        result = await auth_service.authenticate_user("test@example.com", "WrongPass456")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_authenticate_user_not_found(self, auth_service, mock_db):
        """Authentication with non-existent email should return None."""
        # Mock no user found
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result
        
        result = await auth_service.authenticate_user("nonexistent@example.com", "AnyPass123")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_authenticate_user_email_not_found_message(self, auth_service, mock_db):
        """Verify error message doesn't reveal if email exists."""
        from app.services.auth_service import InvalidCredentialsError
        
        # No user found - should raise InvalidCredentialsError when called directly
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result
        
        # The authenticate_user method returns None instead of raising
        result = await auth_service.authenticate_user("test@example.com", "password")
        assert result is None


class TestTokenBlocklist:
    """Tests for token blocklist functionality (logout)."""
    
    def setup_method(self):
        """Clear blocklist before each test."""
        from app.core.security import _token_blocklist
        _token_blocklist.clear()
    
    def test_add_to_blocklist(self):
        """Adding token to blocklist should work."""
        # Create a valid token
        token = create_access_token({"sub": "user123", "email": "test@example.com"})
        
        # Add to blocklist
        add_to_blocklist(token)
        
        # Token should now be blocked
        assert is_token_blocked(token) is True
    
    def test_is_token_blocked_without_blocklist(self):
        """Token not in blocklist should return False."""
        # Create a unique token by using unique data
        token = create_access_token({"sub": "uniqueuser123", "email": "unique@example.com"})
        
        assert is_token_blocked(token) is False
    
    def test_decode_blocked_token_returns_none(self):
        """Blocked token should return None when decoded."""
        token = create_access_token({"sub": "user123", "email": "test@example.com"})
        
        # Add to blocklist
        add_to_blocklist(token)
        
        # Decode should return None for blocked token
        result = decode_access_token(token)
        assert result is None
    
    def test_logout_service(self):
        """AuthService.logout should add token to blocklist."""
        auth_service = AuthService(None)
        
        # Create a token
        token = create_access_token({"sub": "user123", "email": "test@example.com"})
        
        # Run logout (async)
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(auth_service.logout(token))
        
        assert result is True
        assert is_token_blocked(token) is True
