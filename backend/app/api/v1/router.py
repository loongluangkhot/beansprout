"""
API v1 Router Configuration

This module aggregates all v1 API endpoints into a single router.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth

api_router = APIRouter(prefix="/v1")

# Include authentication endpoints
api_router.include_router(auth.router)
