"""
Season browse endpoints.
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.schemas.season import (
    SeasonBrowseResponse,
    SeasonCreateRequest,
    SeasonCreateResponse,
    SeasonDetailResponse,
    SeasonJoinResponse,
    SeasonScheduleRequest,
    SeasonScheduleResponse,
)
from app.services.season_service import SeasonService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seasons", tags=["Seasons"])


def _extract_optional_user_id(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    payload = decode_access_token(auth_header.split(" ")[1])
    if not payload:
        return None
    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        return None
    try:
        UUID(user_id)
    except ValueError:
        return None
    return user_id


def _extract_required_user_id(request: Request) -> str:
    user_id = _extract_optional_user_id(request)
    if not user_id:
        raise ValueError("Missing or invalid authorization header")
    return user_id


@router.get(
    "",
    response_model=SeasonBrowseResponse,
    summary="Browse public seasons",
    description="Returns paginated public published seasons for season library browsing.",
)
async def list_public_seasons(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None),
    genre: str | None = Query(default=None),
    schedule: str | None = Query(default=None, pattern="^this-week$"),
    db: AsyncSession = Depends(get_db),
) -> SeasonBrowseResponse:
    service = SeasonService(db)

    try:
        result = await service.list_public_seasons(
            page=page,
            page_size=page_size,
            search=search,
            genre=genre,
            schedule=schedule,
        )
        return SeasonBrowseResponse.model_validate(result.to_response(page=page, page_size=page_size))
    except SQLAlchemyError as exc:
        logger.error("Error loading public seasons: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "An error occurred while loading season library",
            },
        )
    except ValidationError as exc:
        logger.error("Invalid season payload generated: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "Season data failed validation while loading season library",
            },
        )


@router.get(
    "/{season_id}",
    response_model=SeasonDetailResponse,
    summary="Get public season detail",
    description="Returns season detail information including upcoming meetups.",
)
async def get_public_season_detail(
    season_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> SeasonDetailResponse:
    service = SeasonService(db)
    viewer_user_id = _extract_optional_user_id(request)

    try:
        result = await service.get_public_season_detail(
            season_id=str(season_id),
            viewer_user_id=viewer_user_id,
        )
        if result is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                media_type="application/problem+json",
                content={
                    "type": "about:blank",
                    "title": "Not Found",
                    "status": 404,
                    "detail": "Season not found",
                },
            )

        return SeasonDetailResponse.model_validate(result.to_response())
    except SQLAlchemyError as exc:
        logger.error("Error loading season detail for %s: %s", season_id, exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "An error occurred while loading season detail",
            },
        )
    except ValidationError as exc:
        logger.error("Invalid season detail payload for %s: %s", season_id, exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "Season detail data failed validation",
            },
        )


@router.post(
    "",
    response_model=SeasonCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new season",
    description="Creates a new season for an authenticated user.",
)
async def create_season(
    payload: SeasonCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> SeasonCreateResponse:
    service = SeasonService(db)

    try:
        user_id = _extract_required_user_id(request)
    except ValueError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Unauthorized",
                "status": 401,
                "detail": "Missing or invalid authorization header",
            },
        )

    try:
        result = await service.create_season(
            title=payload.title,
            book_title=payload.book_title,
            book_author=payload.book_author,
            description=payload.description,
            cover_image_url=payload.cover_image_url,
            theme=payload.theme,
            max_members=payload.max_members,
            membership_mode=payload.membership_mode,
            created_by_user_id=user_id,
        )
        return SeasonCreateResponse(data=result, meta={})
    except LookupError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Unauthorized",
                "status": 401,
                "detail": "Invalid authentication subject",
            },
        )
    except SQLAlchemyError as exc:
        logger.error("Error creating season: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "An error occurred while creating season",
            },
        )
    except ValueError as exc:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Unprocessable Entity",
                "status": 422,
                "detail": str(exc),
            },
        )


@router.post(
    "/{season_id}/join",
    response_model=SeasonJoinResponse,
    summary="Join a public season",
    description="Adds authenticated user as a season member if capacity allows.",
)
async def join_public_season(
    season_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> SeasonJoinResponse:
    service = SeasonService(db)

    try:
        user_id = _extract_required_user_id(request)
    except ValueError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Unauthorized",
                "status": 401,
                "detail": "Missing or invalid authorization header",
            },
        )

    try:
        result = await service.join_season(season_id=str(season_id), user_id=user_id)
        if result is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                media_type="application/problem+json",
                content={
                    "type": "about:blank",
                    "title": "Not Found",
                    "status": 404,
                    "detail": "Season not found",
                },
            )
        if result.get("is_full") and not result.get("is_member"):
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                media_type="application/problem+json",
                content={
                    "type": "about:blank",
                    "title": "Conflict",
                    "status": 409,
                    "detail": "Season is full",
                },
            )
        return SeasonJoinResponse.model_validate({"data": result, "meta": {}})
    except SQLAlchemyError as exc:
        logger.error("Error joining season %s: %s", season_id, exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "An error occurred while joining season",
            },
        )


@router.patch(
    "/{season_id}/schedule",
    response_model=SeasonScheduleResponse,
    summary="Update season schedule",
    description="Updates schedule details and meetup dates for a season creator.",
)
async def update_season_schedule(
    season_id: UUID,
    payload: SeasonScheduleRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> SeasonScheduleResponse:
    service = SeasonService(db)

    try:
        user_id = _extract_required_user_id(request)
    except ValueError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Unauthorized",
                "status": 401,
                "detail": "Missing or invalid authorization header",
            },
        )

    try:
        result = await service.update_schedule(
            season_id=str(season_id),
            requester_user_id=user_id,
            payload=payload,
        )
        if result is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                media_type="application/problem+json",
                content={
                    "type": "about:blank",
                    "title": "Not Found",
                    "status": 404,
                    "detail": "Season not found",
                },
            )
        return SeasonScheduleResponse(data=result, meta={})
    except PermissionError:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Forbidden",
                "status": 403,
                "detail": "Only the season creator can update schedule",
            },
        )
    except ValueError as exc:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Unprocessable Entity",
                "status": 422,
                "detail": str(exc),
            },
        )
    except SQLAlchemyError as exc:
        logger.error("Error updating season schedule for %s: %s", season_id, exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            media_type="application/problem+json",
            content={
                "type": "about:blank",
                "title": "Internal Server Error",
                "status": 500,
                "detail": "An error occurred while updating season schedule",
            },
        )
