"""
FastAPI Application Configuration

This module defines the Pydantic settings for the application.
"""

import os
from typing import Union

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    # Application
    APP_NAME: str = "beansprout"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/beansprout"

    # Security - MUST be set via environment variable in production
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS - can be comma-separated list or single origin
    CORS_ORIGINS: Union[str, list[str]] = "http://localhost:3000"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, list[str]]) -> list[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @model_validator(mode="after")
    def validate_secret_key(self) -> "Settings":
        """Validate that SECRET_KEY is properly configured."""
        if not self.SECRET_KEY:
            raise ValueError(
                "SECRET_KEY must be set via environment variable. "
                "Generate a secure key with: python -c 'import secrets; print(secrets.token_hex(32))'"
            )
        
        # Warn about using the default placeholder in non-debug mode
        if self.SECRET_KEY == "your-secret-key-change-in-production" and not self.DEBUG:
            import warnings
            warnings.warn(
                "SECRET_KEY is using the default placeholder value. "
                "This is insecure for production environments!",
                UserWarning
            )
        
        return self

    # API
    API_V1_PREFIX: str = "/api"


settings = Settings()
