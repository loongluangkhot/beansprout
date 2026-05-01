"""
Season browse business logic.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.season import (
    SeasonBrowseItem,
    SeasonBrowseResult,
    SeasonDetailItem,
    SeasonDetailMeetup,
    SeasonProfileSummary,
    SeasonDetailResult,
)


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

    async def get_public_season_detail(self, season_id: str) -> SeasonDetailResult | None:
        detail_query = text(
            """
            SELECT
              s.id::text AS id,
              s.title AS title,
              s.theme AS theme,
              s.description AS description,
              s.book_title AS book_title,
              s.book_author AS book_author,
              s.cover_image_url AS cover_image_url,
              s.location_name AS location_name,
              s.location_url AS location_url,
              s.created_by_user_id::text AS creator_id,
              COALESCE(creator.display_name, creator.email) AS creator_name,
              creator.bio AS creator_bio,
              creator.profile_photo_url AS creator_profile_photo_url,
              COUNT(sm.user_id)::int AS member_count
            FROM seasons s
            LEFT JOIN users creator
              ON creator.id = s.created_by_user_id
            LEFT JOIN season_members sm
              ON sm.season_id = s.id
            WHERE s.id::text = :season_id
              AND s.is_public = true
              AND s.status = 'published'
            GROUP BY
              s.id, s.title, s.theme, s.description, s.book_title, s.book_author,
              s.cover_image_url, s.location_name, s.location_url,
              s.created_by_user_id, creator.display_name, creator.email, creator.bio, creator.profile_photo_url
            """
        )
        members_query = text(
            """
            SELECT
              u.id::text AS id,
              COALESCE(u.display_name, u.email) AS name,
              u.profile_photo_url AS profile_photo_url
            FROM season_members sm
            JOIN users u
              ON u.id = sm.user_id
            JOIN seasons s
              ON s.id = sm.season_id
            WHERE s.id::text = :season_id
              AND s.is_public = true
              AND s.status = 'published'
            ORDER BY COALESCE(u.display_name, u.email) ASC
            """
        )
        meetups_query = text(
            """
            SELECT
              m.id::text AS id,
              m.starts_at AS starts_at
            FROM meetups m
            JOIN seasons s
              ON s.id = m.season_id
            WHERE s.id::text = :season_id
              AND s.is_public = true
              AND s.status = 'published'
              AND m.starts_at >= NOW()
            ORDER BY m.starts_at ASC
            """
        )

        detail_result = await self.db.execute(detail_query, {"season_id": season_id})
        detail_row = detail_result.mappings().first()
        if detail_row is None:
            return None

        meetups_result = await self.db.execute(meetups_query, {"season_id": season_id})
        meetup_rows = meetups_result.mappings().all()
        meetups = [SeasonDetailMeetup.model_validate(dict(row)) for row in meetup_rows]

        members_result = await self.db.execute(members_query, {"season_id": season_id})
        member_rows = members_result.mappings().all()
        members = [SeasonProfileSummary.model_validate(dict(row)) for row in member_rows]

        item_data = dict(detail_row)
        creator_id = item_data.pop("creator_id", None)
        creator_name = item_data.pop("creator_name", None)
        creator_bio = item_data.pop("creator_bio", None)
        creator_profile_photo_url = item_data.pop("creator_profile_photo_url", None)
        if creator_id and creator_name:
            item_data["creator"] = SeasonProfileSummary(
                id=creator_id,
                name=creator_name,
                bio=creator_bio,
                profile_photo_url=creator_profile_photo_url,
            )
        else:
            item_data["creator"] = None
        item_data["members"] = members
        item_data["meetups"] = meetups

        item = SeasonDetailItem.model_validate(item_data)
        return SeasonDetailResult(item=item)
