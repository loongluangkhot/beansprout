"""
Season browse schemas.
"""

from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator, field_validator


class SeasonBrowseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    theme: str | None = None
    next_meetup_at: datetime | None = None
    book_title: str
    book_author: str
    cover_image_url: str | None = None
    member_count: int = 0
    max_members: int | None = Field(default=None, ge=1)


class SeasonBrowseMeta(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    has_next: bool


class SeasonBrowseResponse(BaseModel):
    data: list[SeasonBrowseItem]
    meta: SeasonBrowseMeta


class CreatorSeasonItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    book_title: str
    status: str
    is_public: bool
    created_at: datetime


class CreatorSeasonListMeta(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    has_next: bool


class CreatorSeasonListResponse(BaseModel):
    data: list[CreatorSeasonItem]
    meta: CreatorSeasonListMeta


class SeasonBrowseResult(BaseModel):
    items: list[SeasonBrowseItem]
    total: int

    def to_response(self, page: int, page_size: int) -> dict[str, Any]:
        return {
            "data": [item.model_dump(mode="json") for item in self.items],
            "meta": {
                "page": page,
                "page_size": page_size,
                "total": self.total,
                "has_next": page * page_size < self.total,
            },
        }


class SeasonDetailMeetup(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    starts_at: datetime


class SeasonProfileSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    bio: str | None = None
    profile_photo_url: str | None = None


class SeasonDetailItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    title: str
    theme: str | None = None
    description: str | None = None
    book_title: str
    book_author: str
    cover_image_url: str | None = None
    member_count: int = 0
    max_members: int | None = Field(default=None, ge=1)
    location_mode: str = "in-person"
    location_name: str | None = None
    location_url: str | None = None
    location_address: str | None = None
    is_member: bool = False
    can_join: bool = False
    is_full: bool = False
    creator: "SeasonProfileSummary | None" = None
    members: list["SeasonProfileSummary"] = Field(default_factory=list)
    meetups: list[SeasonDetailMeetup] = Field(default_factory=list)


class SeasonDetailMeta(BaseModel):
    meetup_count: int = Field(ge=0)


class SeasonDetailResponse(BaseModel):
    data: SeasonDetailItem
    meta: SeasonDetailMeta


class SeasonDetailResult(BaseModel):
    item: SeasonDetailItem

    def to_response(self) -> dict[str, Any]:
        return {
            "data": self.item.model_dump(mode="json"),
            "meta": {
                "meetup_count": len(self.item.meetups),
            },
        }


class SeasonJoinData(BaseModel):
    season_id: str
    joined: bool
    is_member: bool
    member_count: int = Field(ge=0)
    max_members: int | None = Field(default=None, ge=1)
    is_full: bool


class SeasonJoinResponse(BaseModel):
    data: SeasonJoinData
    meta: dict[str, Any] = Field(default_factory=dict)


class SeasonCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    book_title: str = Field(min_length=1, max_length=255)
    book_author: str = Field(min_length=1, max_length=255)
    description: str | None = None
    cover_image_url: str | None = Field(default=None, max_length=500)
    theme: str | None = Field(default=None, max_length=255)
    max_members: int | None = Field(default=None, ge=1, le=500)
    membership_mode: str | None = None
    location_mode: str | None = None
    location_name: str | None = Field(default=None, max_length=255)
    location_url: HttpUrl | None = None
    location_address: str | None = Field(default=None, max_length=500)

    @field_validator("title", "book_title", "book_author", mode="before")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        normalized = value.strip()
        if not normalized:
            raise ValueError("must not be empty")
        return normalized

    @field_validator(
        "description",
        "cover_image_url",
        "theme",
        "location_name",
        "location_address",
        mode="before",
    )
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("must be a string")
        normalized = value.strip()
        return normalized or None

    @field_validator("membership_mode", mode="before")
    @classmethod
    def normalize_membership_mode(cls, value: str | None) -> str:
        if value is None:
            return "auto-join"
        if not isinstance(value, str):
            raise ValueError("must be a string")
        normalized = value.strip().lower()
        if normalized not in {"auto-join", "approval-required"}:
            raise ValueError("must be one of: auto-join, approval-required")
        return normalized

    @field_validator("location_mode", mode="before")
    @classmethod
    def normalize_location_mode(cls, value: str | None) -> str:
        if value is None:
            return "in-person"
        if not isinstance(value, str):
            raise ValueError("must be a string")
        normalized = value.strip().lower()
        if normalized not in {"virtual", "in-person"}:
            raise ValueError("must be one of: virtual, in-person")
        return normalized

    @model_validator(mode="after")
    def validate_location_fields(self) -> "SeasonCreateRequest":
        location_url = str(self.location_url) if self.location_url is not None else None

        if self.location_mode == "virtual" and not location_url:
            raise ValueError("location_url is required when location_mode is virtual")

        return self


class SeasonCreateData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    book_title: str
    book_author: str
    description: str | None = None
    cover_image_url: str | None = None
    theme: str | None = None
    max_members: int | None = Field(default=None, ge=1)
    membership_mode: str
    location_mode: str = "in-person"
    location_name: str | None = None
    location_url: str | None = None
    location_address: str | None = None
    created_by_user_id: str
    status: str
    is_public: bool


class SeasonCreateResponse(BaseModel):
    data: SeasonCreateData
    meta: dict[str, Any] = Field(default_factory=dict)


class SeasonScheduleFrequency(str):
    WEEKLY = "weekly"
    BI_WEEKLY = "bi-weekly"
    MONTHLY = "monthly"


class SeasonScheduleRequest(BaseModel):
    start_date: datetime
    duration_weeks: int = Field(ge=1, le=52)
    frequency: str
    meetup_datetimes: list[datetime] | None = None

    @field_validator("start_date", mode="before")
    @classmethod
    def normalize_start_date(cls, value: datetime | str) -> datetime:
        if isinstance(value, str):
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if not isinstance(value, datetime):
            raise ValueError("must be a datetime")
        if value.tzinfo is None:
            raise ValueError("must include timezone")
        return value.astimezone(UTC)

    @field_validator("frequency", mode="before")
    @classmethod
    def validate_frequency(cls, value: str) -> str:
        if not isinstance(value, str):
            raise ValueError("must be a string")
        normalized = value.strip().lower()
        allowed = {
            SeasonScheduleFrequency.WEEKLY,
            SeasonScheduleFrequency.BI_WEEKLY,
            SeasonScheduleFrequency.MONTHLY,
        }
        if normalized not in allowed:
            raise ValueError("must be one of: weekly, bi-weekly, monthly")
        return normalized

    @field_validator("meetup_datetimes", mode="before")
    @classmethod
    def normalize_meetup_datetimes(
        cls, value: list[datetime | str] | None
    ) -> list[datetime] | None:
        if value is None:
            return None
        normalized: list[datetime] = []
        for item in value:
            dt = item
            if isinstance(item, str):
                dt = datetime.fromisoformat(item.replace("Z", "+00:00"))
            if not isinstance(dt, datetime):
                raise ValueError("meetup datetime must be a datetime")
            if dt.tzinfo is None:
                raise ValueError("meetup datetime must include timezone")
            normalized.append(dt.astimezone(UTC))
        return normalized


class SeasonScheduleData(BaseModel):
    season_id: str
    start_date: datetime
    end_date: datetime
    duration_weeks: int
    frequency: str
    meetup_datetimes: list[datetime]
    meetup_count: int = Field(ge=0)


class SeasonScheduleResponse(BaseModel):
    data: SeasonScheduleData
    meta: dict[str, Any] = Field(default_factory=dict)
