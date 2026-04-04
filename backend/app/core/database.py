"""
Database Connection Module

This module provides lazy singleton database engine and session factory.
Should be used by all endpoints instead of creating engines inline.
"""

from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# Lazy singleton engine - created only when first accessed
_engine = None
_session_factory = None


def get_engine():
    """
    Get the lazy singleton database engine.
    
    Returns:
        The async database engine (singleton)
    """
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,  # Verify connections before use
            pool_size=10,  # Default pool size
            max_overflow=20,  # Additional connections when pool is full
        )
    return _engine


def get_async_session_factory():
    """
    Get the lazy singleton session factory.
    
    Returns:
        The async session factory (singleton)
    """
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            expire_on_commit=False,
        )
    return _session_factory


async def get_db() -> AsyncIterator[AsyncSession]:
    """
    Dependency to get database session.
    
    Creates a new async session for each request and ensures
    proper cleanup after the request completes.
    """
    async_session_factory = get_async_session_factory()
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
