"""
Season browse schemas.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


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


class SeasonBrowseMeta(BaseModel):
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    has_next: bool


class SeasonBrowseResponse(BaseModel):
    data: list[SeasonBrowseItem]
    meta: SeasonBrowseMeta


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
    title: str
    theme: str | None = None
    description: str | None = None
    book_title: str
    book_author: str
    cover_image_url: str | None = None
    member_count: int = 0
    location_name: str | None = None
    location_url: str | None = None
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
