"""
Season browse business logic.
"""

from datetime import UTC, datetime, timedelta
from urllib.parse import urlparse
from uuid import UUID

from sqlalchemy import and_, exists, func, literal, or_, select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meetup import Meetup
from app.models.season import Season
from app.models.season_member import SeasonMember
from app.models.user import User

from app.schemas.season import (
    SeasonBrowseItem,
    SeasonBrowseResult,
    SeasonCreateData,
    SeasonDetailItem,
    SeasonDetailMeetup,
    SeasonProfileSummary,
    SeasonScheduleData,
    SeasonScheduleRequest,
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
        now_utc = datetime.now(UTC)

        filters = [Season.is_public.is_(True), Season.status == "published"]

        if normalized_search:
            search_like = f"%{normalized_search}%"
            filters.append(
                or_(
                    Season.title.ilike(search_like),
                    Season.book_title.ilike(search_like),
                    Season.theme.ilike(search_like),
                )
            )

        if normalized_genre:
            filters.append(
                func.lower(func.trim(func.coalesce(Season.theme, "")))
                == func.lower(func.trim(literal(normalized_genre)))
            )

        if schedule == "this-week":
            week_start = now_utc - timedelta(days=now_utc.weekday())
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            week_end = week_start + timedelta(days=7)
            filters.append(
                exists(
                    select(1).where(
                        and_(
                            Meetup.season_id == Season.id,
                            Meetup.starts_at >= week_start,
                            Meetup.starts_at < week_end,
                        )
                    )
                )
            )

        next_meetup_at = func.min(Meetup.starts_at).label("next_meetup_at")
        member_count = func.count(func.distinct(SeasonMember.user_id)).label("member_count")

        list_query = (
            select(
                Season.id,
                Season.title,
                Season.theme,
                next_meetup_at,
                Season.book_title,
                Season.book_author,
                Season.cover_image_url,
                member_count,
                Season.max_members,
            )
            .outerjoin(
                Meetup,
                and_(Meetup.season_id == Season.id, Meetup.starts_at >= now_utc),
            )
            .outerjoin(SeasonMember, SeasonMember.season_id == Season.id)
            .where(*filters)
            .group_by(
                Season.id,
                Season.title,
                Season.theme,
                Season.book_title,
                Season.book_author,
                Season.cover_image_url,
                Season.max_members,
                Season.created_at,
            )
            .order_by(next_meetup_at.asc().nulls_last(), Season.created_at.desc())
            .limit(page_size)
            .offset(offset)
        )

        count_query = select(func.count()).select_from(Season).where(*filters)

        list_result = await self.db.execute(list_query)
        rows = list_result.mappings().all()

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one() or 0

        items = [
            SeasonBrowseItem.model_validate(
                {
                    "id": str(row["id"]),
                    "title": row["title"],
                    "theme": row["theme"],
                    "next_meetup_at": row["next_meetup_at"],
                    "book_title": row["book_title"],
                    "book_author": row["book_author"],
                    "cover_image_url": row["cover_image_url"],
                    "member_count": int(row["member_count"] or 0),
                    "max_members": row.get("max_members"),
                }
            )
            for row in rows
        ]
        return SeasonBrowseResult(items=items, total=total)

    async def get_public_season_detail(
        self,
        season_id: str,
        viewer_user_id: str | None = None,
    ) -> SeasonDetailResult | None:
        creator = User.__table__.alias("creator")
        now_utc = datetime.now(UTC)
        try:
            season_uuid = UUID(season_id)
        except ValueError:
            return None

        detail_query = (
            select(
                Season.id.label("id"),
                Season.title.label("title"),
                Season.theme.label("theme"),
                Season.description.label("description"),
                Season.book_title.label("book_title"),
                Season.book_author.label("book_author"),
                Season.cover_image_url.label("cover_image_url"),
                Season.location_mode.label("location_mode"),
                Season.location_name.label("location_name"),
                Season.location_url.label("location_url"),
                Season.location_address.label("location_address"),
                Season.max_members.label("max_members"),
                Season.created_by_user_id.label("creator_id"),
                func.coalesce(creator.c.display_name, creator.c.email).label("creator_name"),
                creator.c.bio.label("creator_bio"),
                creator.c.profile_photo_url.label("creator_profile_photo_url"),
                func.count(func.distinct(SeasonMember.user_id)).label("member_count"),
            )
            .select_from(Season)
            .outerjoin(creator, creator.c.id == Season.created_by_user_id)
            .outerjoin(SeasonMember, SeasonMember.season_id == Season.id)
            .where(
                Season.id == season_uuid,
                Season.is_public.is_(True),
                Season.status == "published",
            )
            .group_by(
                Season.id,
                Season.title,
                Season.theme,
                Season.description,
                Season.book_title,
                Season.book_author,
                Season.cover_image_url,
                Season.location_mode,
                Season.location_name,
                Season.location_url,
                Season.location_address,
                Season.max_members,
                Season.created_by_user_id,
                creator.c.display_name,
                creator.c.email,
                creator.c.bio,
                creator.c.profile_photo_url,
            )
        )

        members_query = (
            select(
                User.id.label("id"),
                func.coalesce(User.display_name, User.email).label("name"),
                User.profile_photo_url.label("profile_photo_url"),
            )
            .select_from(SeasonMember)
            .join(User, User.id == SeasonMember.user_id)
            .join(Season, Season.id == SeasonMember.season_id)
            .where(
                Season.id == season_uuid,
                Season.is_public.is_(True),
                Season.status == "published",
            )
            .order_by(func.coalesce(User.display_name, User.email).asc())
        )

        meetups_query = (
            select(Meetup.id.label("id"), Meetup.starts_at.label("starts_at"))
            .select_from(Meetup)
            .join(Season, Season.id == Meetup.season_id)
            .where(
                Season.id == season_uuid,
                Season.is_public.is_(True),
                Season.status == "published",
                Meetup.starts_at >= now_utc,
            )
            .order_by(Meetup.starts_at.asc())
        )

        detail_result = await self.db.execute(detail_query)
        detail_row = detail_result.mappings().first()
        if detail_row is None:
            return None

        meetups_result = await self.db.execute(meetups_query)
        meetup_rows = meetups_result.mappings().all()
        meetups = [
            SeasonDetailMeetup.model_validate(
                {"id": str(row["id"]), "starts_at": row["starts_at"]}
            )
            for row in meetup_rows
        ]

        members_result = await self.db.execute(members_query)
        member_rows = members_result.mappings().all()
        members = [
            SeasonProfileSummary.model_validate(
                {
                    "id": str(row["id"]),
                    "name": row["name"],
                    "profile_photo_url": row["profile_photo_url"],
                }
            )
            for row in member_rows
        ]

        item_data = dict(detail_row)
        item_data["id"] = str(item_data["id"])
        if item_data.get("creator_id") is not None:
            item_data["creator_id"] = str(item_data["creator_id"])
        member_count = int(item_data.get("member_count", 0))
        max_members = item_data.pop("max_members", None)
        max_members_value = int(max_members) if max_members is not None else None
        item_data["max_members"] = max_members_value
        is_full = (
            max_members_value is not None and member_count >= max_members_value
        )

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

        is_member = False
        if viewer_user_id:
            is_member = any(member.id == viewer_user_id for member in members)

        item_data["is_member"] = is_member
        item_data["is_full"] = is_full
        item_data["can_join"] = not is_member and not is_full
        item_data["members"] = members
        item_data["meetups"] = meetups

        item = SeasonDetailItem.model_validate(item_data)
        return SeasonDetailResult(item=item)

    async def join_season(self, season_id: str, user_id: str) -> dict | None:
        join_query = text(
            """
            WITH locked_season AS (
              SELECT s.id, s.max_members
              FROM seasons s
              WHERE s.id::text = :season_id
                AND s.is_public = true
                AND s.status = 'published'
              FOR UPDATE
            ),
            existing_member AS (
              SELECT 1 AS exists_flag
              FROM season_members sm
              JOIN locked_season ls ON ls.id = sm.season_id
              WHERE sm.user_id::text = :user_id
              LIMIT 1
            ),
            current_counts AS (
              SELECT COALESCE(COUNT(sm.user_id), 0)::int AS member_count
              FROM locked_season ls
              LEFT JOIN season_members sm ON sm.season_id = ls.id
            ),
            inserted AS (
              INSERT INTO season_members (season_id, user_id, joined_at)
              SELECT ls.id, :user_id::uuid, NOW()
              FROM locked_season ls
              CROSS JOIN current_counts cc
              WHERE NOT EXISTS (SELECT 1 FROM existing_member)
                AND (ls.max_members IS NULL OR cc.member_count < ls.max_members)
              RETURNING season_id
            )
            SELECT
              ls.id::text AS season_id,
              (EXISTS (SELECT 1 FROM inserted)) AS joined,
              (
                EXISTS (SELECT 1 FROM existing_member)
                OR EXISTS (SELECT 1 FROM inserted)
              ) AS is_member,
              COALESCE((
                SELECT COUNT(*)::int
                FROM season_members sm
                WHERE sm.season_id = ls.id
              ), 0) AS member_count,
              ls.max_members AS max_members,
              CASE
                WHEN ls.max_members IS NULL THEN false
                ELSE (
                  COALESCE((
                    SELECT COUNT(*)::int
                    FROM season_members sm
                    WHERE sm.season_id = ls.id
                  ), 0) >= ls.max_members
                )
              END AS is_full
            FROM locked_season ls
            """
        )
        result = await self.db.execute(
            join_query,
            {
                "season_id": season_id,
                "user_id": user_id,
            },
        )
        row = result.mappings().first()
        if row is None:
            return None
        return dict(row)

    async def create_season(
        self,
        *,
        title: str,
        book_title: str,
        book_author: str,
        created_by_user_id: str,
        description: str | None = None,
        cover_image_url: str | None = None,
        theme: str | None = None,
        max_members: int | None = None,
        membership_mode: str = "auto-join",
        location_mode: str = "in-person",
        location_name: str | None = None,
        location_url: str | None = None,
        location_address: str | None = None,
    ) -> SeasonCreateData:
        try:
            creator_uuid = UUID(created_by_user_id)
        except ValueError as exc:
            raise ValueError("invalid created_by_user_id") from exc

        creator_exists_result = await self.db.execute(
            select(User.id).where(User.id == creator_uuid)
        )
        if creator_exists_result.scalar_one_or_none() is None:
            raise LookupError("creator user not found")

        normalized_title = title.strip()
        normalized_book_title = book_title.strip()
        normalized_book_author = book_author.strip()
        normalized_description = description.strip() if isinstance(description, str) else None
        normalized_cover_image_url = (
            cover_image_url.strip() if isinstance(cover_image_url, str) else None
        )
        normalized_theme = theme.strip() if isinstance(theme, str) else None
        normalized_membership_mode = (
            membership_mode.strip().lower() if isinstance(membership_mode, str) else "auto-join"
        )
        if normalized_membership_mode not in {"auto-join", "approval-required"}:
            raise ValueError("invalid membership_mode")

        normalized_location_mode = (
            location_mode.strip().lower() if isinstance(location_mode, str) else "in-person"
        )
        if normalized_location_mode not in {"virtual", "in-person"}:
            raise ValueError("invalid location_mode")

        normalized_location_name = (
            location_name.strip() if isinstance(location_name, str) else None
        )
        normalized_location_url = location_url.strip() if isinstance(location_url, str) else None
        normalized_location_address = (
            location_address.strip() if isinstance(location_address, str) else None
        )

        if normalized_location_url:
            parsed_location_url = urlparse(normalized_location_url)
            if parsed_location_url.scheme not in {"http", "https"} or not parsed_location_url.netloc:
                raise ValueError("invalid location_url")

        if normalized_location_mode == "virtual" and not normalized_location_url:
            raise ValueError("location_url is required when location_mode is virtual")

        persisted_location_name = normalized_location_name
        if normalized_location_mode == "virtual" and not persisted_location_name:
            persisted_location_name = "Virtual meetup"
        persisted_location_address = (
            normalized_location_address if normalized_location_mode == "in-person" else None
        )

        season = Season(
            title=normalized_title,
            book_title=normalized_book_title,
            book_author=normalized_book_author,
            description=normalized_description or None,
            cover_image_url=normalized_cover_image_url or None,
            theme=normalized_theme or None,
            max_members=max_members,
            membership_mode=normalized_membership_mode,
            location_mode=normalized_location_mode,
            location_name=persisted_location_name or None,
            location_url=normalized_location_url or None,
            location_address=persisted_location_address or None,
            created_by_user_id=creator_uuid,
        )
        self.db.add(season)
        try:
            await self.db.commit()
            await self.db.refresh(season)
        except SQLAlchemyError:
            await self.db.rollback()
            raise

        return SeasonCreateData(
            id=str(season.id),
            title=season.title,
            book_title=season.book_title,
            book_author=season.book_author,
            description=season.description,
            cover_image_url=season.cover_image_url,
            theme=season.theme,
            max_members=season.max_members,
            membership_mode=season.membership_mode,
            location_mode=season.location_mode,
            location_name=season.location_name,
            location_url=season.location_url,
            location_address=season.location_address,
            created_by_user_id=str(season.created_by_user_id),
            status=season.status,
            is_public=season.is_public,
        )

    async def update_schedule(
        self,
        *,
        season_id: str,
        requester_user_id: str,
        payload: SeasonScheduleRequest,
    ) -> SeasonScheduleData | None:
        try:
            season_uuid = UUID(season_id)
        except ValueError as exc:
            raise ValueError("invalid season_id") from exc
        try:
            requester_uuid = UUID(requester_user_id)
        except ValueError as exc:
            raise ValueError("invalid requester_user_id") from exc

        season = await self.db.get(Season, season_uuid)
        if season is None:
            return None
        if season.created_by_user_id != requester_uuid:
            raise PermissionError("Only season creator can update schedule")

        now_utc = datetime.now(UTC)
        start_date = payload.start_date.astimezone(UTC)
        if start_date <= now_utc:
            raise ValueError("start_date must be in the future")

        duration_days = payload.duration_weeks * 7
        end_date = start_date + timedelta(days=duration_days)

        cadence_days_map = {
            "weekly": 7,
            "bi-weekly": 14,
            "monthly": 28,
        }
        cadence_days = cadence_days_map[payload.frequency]

        generated_dates: list[datetime] = []
        current = start_date
        while current < end_date:
            generated_dates.append(current)
            current = current + timedelta(days=cadence_days)

        final_dates = generated_dates
        if payload.meetup_datetimes is not None:
            final_dates = sorted(payload.meetup_datetimes)
            if not final_dates:
                raise ValueError("meetup_datetimes cannot be empty")

        if len(set(final_dates)) != len(final_dates):
            raise ValueError("meetup datetimes must be unique")

        for meetup_at in final_dates:
            if meetup_at < start_date or meetup_at > end_date:
                raise ValueError("meetup datetime must be within season duration")

        delete_query = (
            Meetup.__table__.delete()
            .where(Meetup.season_id == season_uuid)
            .where(Meetup.starts_at >= now_utc)
        )

        try:
            await self.db.execute(delete_query)
            for meetup_at in final_dates:
                self.db.add(
                    Meetup(
                        season_id=season_uuid,
                        starts_at=meetup_at,
                    )
                )
            await self.db.commit()
        except SQLAlchemyError:
            await self.db.rollback()
            raise

        return SeasonScheduleData(
            season_id=season_id,
            start_date=start_date,
            end_date=end_date,
            duration_weeks=payload.duration_weeks,
            frequency=payload.frequency,
            meetup_datetimes=final_dates,
            meetup_count=len(final_dates),
        )
