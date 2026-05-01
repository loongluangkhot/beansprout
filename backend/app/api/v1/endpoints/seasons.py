"""
Season browse endpoints.
"""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.season import SeasonBrowseResponse, SeasonDetailResponse
from app.services.season_service import SeasonService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/seasons", tags=["Seasons"])


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
) -> JSONResponse:
    service = SeasonService(db)

    try:
        result = await service.list_public_seasons(
            page=page,
            page_size=page_size,
            search=search,
            genre=genre,
            schedule=schedule,
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result.to_response(page=page, page_size=page_size),
        )
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
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    service = SeasonService(db)

    try:
        result = await service.get_public_season_detail(season_id=str(season_id))
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

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result.to_response(),
        )
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
