"""
Season browse business logic.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.season import SeasonBrowseItem, SeasonBrowseResult


class SeasonService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_public_seasons(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        genre: str | None = None,
        schedule: str | None = None,
    ) -> SeasonBrowseResult:
        offset = (page - 1) * page_size
        normalized_search = search.strip() if search else None
        normalized_genre = genre.strip() if genre else None

        list_query = text(
            """
            SELECT
              s.id::text AS id,
              s.title AS title,
              s.theme AS theme,
              MIN(m.starts_at) AS next_meetup_at,
              s.book_title AS book_title,
              s.book_author AS book_author,
              s.cover_image_url AS cover_image_url,
              COUNT(sm.user_id)::int AS member_count
            FROM seasons s
            LEFT JOIN meetups m
              ON m.season_id = s.id
              AND m.starts_at >= NOW()
            LEFT JOIN season_members sm
              ON sm.season_id = s.id
            WHERE s.is_public = true
              AND s.status = 'published'
              AND (
                :search IS NULL OR
                s.title ILIKE :search_like OR
                s.book_title ILIKE :search_like OR
                s.theme ILIKE :search_like
              )
              AND (
                :genre IS NULL OR
                LOWER(TRIM(COALESCE(s.theme, ''))) = LOWER(TRIM(:genre))
              )
              AND (
                :schedule IS NULL OR (
                  :schedule = 'this-week' AND EXISTS (
                    SELECT 1
                    FROM meetups m2
                    WHERE m2.season_id = s.id
                      AND m2.starts_at >= DATE_TRUNC('week', NOW())
                      AND m2.starts_at < DATE_TRUNC('week', NOW()) + INTERVAL '1 week'
                  )
                )
              )
            GROUP BY s.id, s.title, s.theme, s.book_title, s.book_author, s.cover_image_url
            ORDER BY next_meetup_at ASC NULLS LAST, s.created_at DESC
            LIMIT :limit OFFSET :offset
            """
        )
        count_query = text(
            """
            SELECT COUNT(*)::int AS total
            FROM seasons s
            WHERE s.is_public = true
              AND s.status = 'published'
              AND (
                :search IS NULL OR
                s.title ILIKE :search_like OR
                s.book_title ILIKE :search_like OR
                s.theme ILIKE :search_like
              )
              AND (
                :genre IS NULL OR
                LOWER(TRIM(COALESCE(s.theme, ''))) = LOWER(TRIM(:genre))
              )
              AND (
                :schedule IS NULL OR (
                  :schedule = 'this-week' AND EXISTS (
                    SELECT 1
                    FROM meetups m2
                    WHERE m2.season_id = s.id
                      AND m2.starts_at >= DATE_TRUNC('week', NOW())
                      AND m2.starts_at < DATE_TRUNC('week', NOW()) + INTERVAL '1 week'
                  )
                )
              )
            """
        )

        query_params = {
            "limit": page_size,
            "offset": offset,
            "search": normalized_search,
            "search_like": f"%{normalized_search}%" if normalized_search else None,
            "genre": normalized_genre,
            "schedule": schedule,
        }

        list_result = await self.db.execute(list_query, query_params)
        rows = list_result.mappings().all()

        count_result = await self.db.execute(count_query, query_params)
        total = count_result.scalar_one() or 0

        items = [SeasonBrowseItem.model_validate(dict(row)) for row in rows]
        return SeasonBrowseResult(items=items, total=total)
