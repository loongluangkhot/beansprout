"""
Season browse endpoint tests.
"""

from unittest.mock import AsyncMock, MagicMock
from uuid import UUID, uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.core.security import create_access_token
from app.main import app
from app.services.season_service import SeasonService

SEASON_UUID = str(uuid4())


@pytest.fixture
def mock_db_session():
    session = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def client(mock_db_session):
    async def override_get_db():
        yield mock_db_session

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


class TestSeasonBrowseEndpoint:
    def test_returns_paginated_public_seasons_with_meta(self, client, mock_db_session):
        list_result = MagicMock()
        count_result = MagicMock()
        mock_db_session.execute.side_effect = [list_result, count_result]

        list_result.mappings.return_value.all.return_value = [
            {
                "id": "season-1",
                "title": "Spring Reads",
                "theme": "Contemporary",
                "next_meetup_at": "2026-05-10T10:00:00Z",
                "book_title": "Tomorrow, and Tomorrow, and Tomorrow",
                "book_author": "Gabrielle Zevin",
                "cover_image_url": "https://example.com/cover.jpg",
                "member_count": 12,
            }
        ]
        count_result.scalar_one.return_value = 1

        response = client.get("/api/v1/seasons?page=1&page_size=10")

        assert response.status_code == 200
        payload = response.json()
        assert "data" in payload
        assert "meta" in payload
        assert payload["meta"]["page"] == 1
        assert payload["meta"]["page_size"] == 10
        assert len(payload["data"]) == 1

    def test_returns_empty_data_with_valid_meta(self, client, mock_db_session):
        list_result = MagicMock()
        count_result = MagicMock()
        mock_db_session.execute.side_effect = [list_result, count_result]

        list_result.mappings.return_value.all.return_value = []
        count_result.scalar_one.return_value = 0

        response = client.get("/api/v1/seasons")

        assert response.status_code == 200
        payload = response.json()
        assert payload["data"] == []
        assert payload["meta"]["total"] == 0
        assert payload["meta"]["has_next"] is False


@pytest.mark.asyncio
async def test_service_applies_filter_params_to_query_execution():
    db = AsyncMock()
    list_result = MagicMock()
    count_result = MagicMock()
    db.execute.side_effect = [list_result, count_result]

    list_result.mappings.return_value.all.return_value = []
    count_result.scalar_one.return_value = 0

    service = SeasonService(db)
    await service.list_public_seasons(
        page=1,
        page_size=10,
        search="spring",
        genre="Contemporary Fiction",
        schedule="this-week",
    )

    assert db.execute.await_count == 2


class TestCreatorSeasonEndpoint:
    def test_returns_creator_seasons_when_authenticated(self, client, mock_db_session):
        list_result = MagicMock()
        count_result = MagicMock()
        mock_db_session.execute.side_effect = [list_result, count_result]
        list_result.mappings.return_value.all.return_value = [
            {
                "id": uuid4(),
                "title": "Spring Reads",
                "book_title": "Tomorrow",
                "status": "published",
                "is_public": True,
                "created_at": "2026-05-16T10:00:00Z",
            }
        ]
        count_result.scalar_one.return_value = 1

        token = create_access_token({"sub": str(uuid4()), "email": "creator@example.com"})
        response = client.get(
            "/api/v1/seasons/mine?page=1&page_size=10",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        payload = response.json()
        assert payload["data"][0]["title"] == "Spring Reads"
        assert payload["data"][0]["status"] == "published"
        assert payload["meta"]["total"] == 1
        assert payload["meta"]["has_next"] is False

    def test_returns_401_for_creator_seasons_when_unauthenticated(self, client):
        response = client.get("/api/v1/seasons/mine")
        assert response.status_code == 401
        assert response.headers["content-type"].startswith("application/problem+json")

    def test_returns_500_when_creator_seasons_query_fails(self, client, mock_db_session):
        mock_db_session.execute.side_effect = SQLAlchemyError("db boom")

        token = create_access_token({"sub": str(uuid4()), "email": "creator@example.com"})
        response = client.get(
            "/api/v1/seasons/mine",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 500
        assert response.headers["content-type"].startswith("application/problem+json")


class TestSeasonDetailEndpoint:
    def test_returns_season_detail_with_schedule_and_location(self, client, mock_db_session):
        detail_result = MagicMock()
        meetups_result = MagicMock()
        members_result = MagicMock()
        mock_db_session.execute.side_effect = [detail_result, meetups_result, members_result]

        detail_result.mappings.return_value.first.return_value = {
            "id": SEASON_UUID,
            "title": "Spring Reads",
            "theme": "Contemporary Fiction",
            "description": "A warm reading circle for reflective readers.",
            "book_title": "Tomorrow, and Tomorrow, and Tomorrow",
            "book_author": "Gabrielle Zevin",
            "cover_image_url": "https://example.com/cover.jpg",
            "creator_id": str(uuid4()),
            "creator_name": "Season Host",
            "creator_bio": "I host reflective, welcoming reading circles.",
            "creator_profile_photo_url": "https://example.com/host.jpg",
            "member_count": 12,
            "location_mode": "in-person",
            "location_name": "Bean & Leaf Cafe",
            "location_url": "https://maps.example.com/bean-leaf",
            "location_address": "123 Main St",
        }
        meetups_result.mappings.return_value.all.return_value = [
            {
                "id": "meetup-1",
                "starts_at": "2026-06-01T10:00:00Z",
            },
            {
                "id": "meetup-2",
                "starts_at": "2026-06-08T10:00:00Z",
            },
        ]
        members_result.mappings.return_value.all.return_value = [
            {"id": str(uuid4()), "name": "Member One", "profile_photo_url": "https://example.com/m1.jpg"},
            {"id": str(uuid4()), "name": "Member Two", "profile_photo_url": None},
        ]

        response = client.get(f"/api/v1/seasons/{SEASON_UUID}")

        assert response.status_code == 200
        payload = response.json()
        assert payload["data"]["id"] == SEASON_UUID
        assert payload["data"]["location_mode"] == "in-person"
        assert payload["data"]["location_name"] == "Bean & Leaf Cafe"
        assert payload["data"]["location_url"] == "https://maps.example.com/bean-leaf"
        assert payload["data"]["location_address"] == "123 Main St"
        assert payload["data"]["creator"]["name"] == "Season Host"
        assert payload["data"]["creator"]["bio"] == "I host reflective, welcoming reading circles."
        assert len(payload["data"]["members"]) == 2
        assert len(payload["data"]["meetups"]) == 2
        assert payload["meta"]["meetup_count"] == 2

    def test_returns_problem_json_when_season_not_found(self, client, mock_db_session):
        detail_result = MagicMock()
        mock_db_session.execute.side_effect = [detail_result]
        detail_result.mappings.return_value.first.return_value = None

        response = client.get(f"/api/v1/seasons/{SEASON_UUID}")

        assert response.status_code == 404
        assert response.headers["content-type"].startswith("application/problem+json")
        payload = response.json()
        assert payload["title"] == "Not Found"
        assert payload["status"] == 404

    def test_returns_422_when_season_id_is_not_uuid(self, client):
        response = client.get("/api/v1/seasons/not-a-uuid")

        assert response.status_code == 422

    def test_returns_problem_json_on_service_sqlalchemy_error(self, client, mock_db_session):
        mock_db_session.execute.side_effect = SQLAlchemyError("db boom")

        response = client.get(f"/api/v1/seasons/{SEASON_UUID}")

        assert response.status_code == 500
        assert response.headers["content-type"].startswith("application/problem+json")
        payload = response.json()
        assert payload["title"] == "Internal Server Error"
        assert payload["status"] == 500
        assert payload["detail"] == "An error occurred while loading season detail"


class TestSeasonJoinEndpoint:
    def test_returns_401_when_missing_auth_header(self, client):
        response = client.post(f"/api/v1/seasons/{SEASON_UUID}/join")
        assert response.status_code == 401

    def test_joins_season_when_authenticated(self, client, mock_db_session):
        join_result = MagicMock()
        mock_db_session.execute.side_effect = [join_result]
        join_result.mappings.return_value.first.return_value = {
            "season_id": SEASON_UUID,
            "joined": True,
            "member_count": 3,
            "max_members": 10,
            "is_full": False,
            "is_member": True,
        }

        token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
        response = client.post(
            f"/api/v1/seasons/{SEASON_UUID}/join",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        payload = response.json()
        assert payload["data"]["season_id"] == SEASON_UUID
        assert payload["data"]["joined"] is True
        assert payload["data"]["is_member"] is True

    def test_returns_404_when_season_not_joinable(self, client, mock_db_session):
        join_result = MagicMock()
        mock_db_session.execute.side_effect = [join_result]
        join_result.mappings.return_value.first.return_value = None

        token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
        response = client.post(
            f"/api/v1/seasons/{SEASON_UUID}/join",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404
        assert response.headers["content-type"].startswith("application/problem+json")

    def test_returns_409_when_season_full(self, client, mock_db_session):
        join_result = MagicMock()
        mock_db_session.execute.side_effect = [join_result]
        join_result.mappings.return_value.first.return_value = {
            "season_id": SEASON_UUID,
            "joined": False,
            "member_count": 10,
            "max_members": 10,
            "is_full": True,
            "is_member": False,
        }

        token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
        response = client.post(
            f"/api/v1/seasons/{SEASON_UUID}/join",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 409
        assert response.headers["content-type"].startswith("application/problem+json")

    def test_returns_success_for_existing_member_idempotently(self, client, mock_db_session):
        join_result = MagicMock()
        mock_db_session.execute.side_effect = [join_result]
        join_result.mappings.return_value.first.return_value = {
            "season_id": SEASON_UUID,
            "joined": False,
            "member_count": 10,
            "max_members": 10,
            "is_full": True,
            "is_member": True,
        }

        token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
        response = client.post(
            f"/api/v1/seasons/{SEASON_UUID}/join",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        payload = response.json()
        assert payload["data"]["season_id"] == SEASON_UUID
        assert payload["data"]["joined"] is False
        assert payload["data"]["is_member"] is True

    def test_returns_problem_json_on_payload_validation_error(self, client, mock_db_session):
        detail_result = MagicMock()
        meetups_result = MagicMock()
        members_result = MagicMock()
        mock_db_session.execute.side_effect = [detail_result, meetups_result, members_result]

        detail_result.mappings.return_value.first.return_value = {
            "id": SEASON_UUID,
            "title": "Spring Reads",
            "theme": "Contemporary Fiction",
            "description": "A warm reading circle for reflective readers.",
            "book_title": "Tomorrow, and Tomorrow, and Tomorrow",
            "book_author": "Gabrielle Zevin",
            "cover_image_url": "https://example.com/cover.jpg",
            "creator_id": str(uuid4()),
            "creator_name": "Season Host",
            "creator_bio": "I host reflective, welcoming reading circles.",
            "creator_profile_photo_url": "https://example.com/host.jpg",
            "member_count": 12,
            "location_mode": "in-person",
            "location_name": "Bean & Leaf Cafe",
            "location_url": "https://maps.example.com/bean-leaf",
            "location_address": "123 Main St",
        }
        meetups_result.mappings.return_value.all.return_value = [
            {"id": "meetup-1", "starts_at": "not-a-datetime"}
        ]
        members_result.mappings.return_value.all.return_value = []

        response = client.get(f"/api/v1/seasons/{SEASON_UUID}")

        assert response.status_code == 500
        assert response.headers["content-type"].startswith("application/problem+json")
        payload = response.json()
        assert payload["title"] == "Internal Server Error"
        assert payload["status"] == 500
        assert payload["detail"] == "Season detail data failed validation"


@pytest.mark.asyncio
async def test_service_returns_none_when_detail_missing():
    db = AsyncMock()
    detail_result = MagicMock()
    db.execute.side_effect = [detail_result]
    detail_result.mappings.return_value.first.return_value = None

    service = SeasonService(db)
    result = await service.get_public_season_detail("missing-season")

    assert result is None


@pytest.mark.asyncio
async def test_service_detail_query_enforces_upcoming_and_ordering_contract():
    db = AsyncMock()
    detail_result = MagicMock()
    meetups_result = MagicMock()
    members_result = MagicMock()
    db.execute.side_effect = [detail_result, meetups_result, members_result]
    detail_result.mappings.return_value.first.return_value = {
        "id": SEASON_UUID,
        "title": "Spring Reads",
        "theme": "Contemporary Fiction",
        "description": "A warm reading circle",
        "book_title": "Tomorrow",
        "book_author": "Gabrielle Zevin",
        "cover_image_url": "https://example.com/cover.jpg",
        "creator_id": str(uuid4()),
        "creator_name": "Season Host",
        "creator_bio": "I host reflective, welcoming reading circles.",
        "creator_profile_photo_url": "https://example.com/host.jpg",
        "location_mode": "in-person",
        "location_name": "Bean & Leaf Cafe",
        "location_url": "https://maps.example.com/bean-leaf",
        "location_address": "123 Main St",
        "member_count": 5,
    }
    meetups_result.mappings.return_value.all.return_value = []
    members_result.mappings.return_value.all.return_value = []

    service = SeasonService(db)
    await service.get_public_season_detail(SEASON_UUID)

    assert db.execute.await_count == 3


@pytest.mark.asyncio
async def test_service_public_list_query_filters_to_published_public_only():
    db = AsyncMock()
    list_result = MagicMock()
    count_result = MagicMock()
    db.execute.side_effect = [list_result, count_result]

    list_result.mappings.return_value.all.return_value = []
    count_result.scalar_one.return_value = 0

    service = SeasonService(db)
    await service.list_public_seasons(page=1, page_size=10)

    list_query = str(db.execute.call_args_list[0].args[0])
    assert "seasons.is_public IS true" in list_query
    assert "seasons.status =" in list_query


@pytest.mark.asyncio
async def test_service_list_public_seasons_uses_distinct_member_count_mapping():
    db = AsyncMock()
    list_result = MagicMock()
    count_result = MagicMock()
    db.execute.side_effect = [list_result, count_result]

    list_result.mappings.return_value.all.return_value = [
        {
            "id": uuid4(),
            "title": "Spring Reads",
            "theme": "Contemporary Fiction",
            "next_meetup_at": "2026-06-01T10:00:00Z",
            "book_title": "Tomorrow",
            "book_author": "Gabrielle Zevin",
            "cover_image_url": "https://example.com/cover.jpg",
            "member_count": 2,
        }
    ]
    count_result.scalar_one.return_value = 1

    service = SeasonService(db)
    result = await service.list_public_seasons(page=1, page_size=10)

    assert result.total == 1
    assert len(result.items) == 1
    assert result.items[0].member_count == 2


@pytest.mark.asyncio
async def test_service_join_season_query_uses_capacity_guard():
    db = AsyncMock()
    join_result = MagicMock()
    db.execute.side_effect = [join_result]
    join_result.mappings.return_value.first.return_value = {
        "season_id": SEASON_UUID,
        "joined": True,
        "member_count": 1,
        "max_members": 10,
        "is_full": False,
        "is_member": True,
    }

    service = SeasonService(db)
    await service.join_season(season_id=SEASON_UUID, user_id=str(uuid4()))

    join_query = str(db.execute.call_args_list[0].args[0])
    assert "FOR UPDATE" in join_query
    assert "INSERT INTO season_members" in join_query


class TestSeasonCreateEndpoint:
    def test_returns_401_when_missing_auth_header(self, client):
        response = client.post(
            "/api/v1/seasons",
            json={
                "title": "Spring Reads",
                "book_title": "Tomorrow",
                "book_author": "Gabrielle Zevin",
            },
        )
        assert response.status_code == 401
        assert response.headers["content-type"].startswith("application/problem+json")

    def test_creates_season_when_authenticated(self, client, mock_db_session):
        async def refresh_side_effect(instance):
            instance.id = uuid4()
            instance.status = "published"
            instance.is_public = True

        mock_db_session.refresh.side_effect = refresh_side_effect
        user_lookup_result = MagicMock()
        user_lookup_result.scalar_one_or_none.return_value = uuid4()
        mock_db_session.execute.return_value = user_lookup_result

        token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
        response = client.post(
            "/api/v1/seasons",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": " Spring Reads ",
                "book_title": " Tomorrow ",
                "book_author": " Gabrielle Zevin ",
                "description": " Warm and welcoming ",
                "cover_image_url": " https://example.com/cover.jpg ",
                "theme": "  Contemporary Relationships  ",
                "max_members": 25,
                "location_mode": "virtual",
                "location_url": "https://meet.example.com/room-1",
            },
        )

        assert response.status_code == 201
        payload = response.json()
        assert payload["data"]["title"] == "Spring Reads"
        assert payload["data"]["book_title"] == "Tomorrow"
        assert payload["data"]["book_author"] == "Gabrielle Zevin"
        assert payload["data"]["description"] == "Warm and welcoming"
        assert payload["data"]["cover_image_url"] == "https://example.com/cover.jpg"
        assert payload["data"]["theme"] == "Contemporary Relationships"
        assert payload["data"]["max_members"] == 25
        assert payload["data"]["membership_mode"] == "auto-join"
        assert payload["data"]["location_mode"] == "virtual"
        assert payload["data"]["location_name"] == "Virtual meetup"
        assert payload["data"]["location_url"] == "https://meet.example.com/room-1"
        assert payload["data"]["location_address"] is None
        assert payload["data"]["status"] == "published"
        assert payload["data"]["is_public"] is True

    def test_rejects_blank_required_fields(self, client):
        token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
        response = client.post(
            "/api/v1/seasons",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "   ",
                "book_title": "",
                "book_author": "Author",
            },
        )

        assert response.status_code == 422
        assert response.headers["content-type"].startswith("application/json")


@pytest.mark.asyncio
async def test_service_create_season_persists_creator_and_defaults():
    db = AsyncMock()
    db.add = MagicMock()
    user_id = str(uuid4())

    async def refresh_side_effect(instance):
        instance.id = uuid4()
        instance.status = "published"
        instance.is_public = True

    db.refresh.side_effect = refresh_side_effect
    user_lookup_result = MagicMock()
    user_lookup_result.scalar_one_or_none.return_value = UUID(user_id)
    db.execute.return_value = user_lookup_result

    service = SeasonService(db)
    result = await service.create_season(
        title=" Spring Reads ",
        book_title=" Tomorrow ",
        book_author=" Gabrielle Zevin ",
        description=" Warm circle ",
        cover_image_url=" https://example.com/cover.jpg ",
        theme="  Contemporary Relationships  ",
        max_members=25,
        membership_mode="approval-required",
        location_mode="in-person",
        location_name="Bean & Leaf Cafe",
        location_address="123 Main St",
        location_url="https://maps.example.com/bean-leaf",
        created_by_user_id=user_id,
    )

    assert result.title == "Spring Reads"
    assert result.book_title == "Tomorrow"
    assert result.book_author == "Gabrielle Zevin"
    assert result.description == "Warm circle"
    assert result.cover_image_url == "https://example.com/cover.jpg"
    assert result.theme == "Contemporary Relationships"
    assert result.max_members == 25
    assert result.membership_mode == "approval-required"
    assert result.location_mode == "in-person"
    assert result.location_name == "Bean & Leaf Cafe"
    assert result.location_url == "https://maps.example.com/bean-leaf"
    assert result.location_address == "123 Main St"
    assert result.created_by_user_id == user_id
    assert result.status == "published"
    assert result.is_public is True
    assert db.add.call_count == 1
    assert db.commit.await_count == 1


def test_returns_401_when_token_subject_user_not_found(client, mock_db_session):
    user_lookup_result = MagicMock()
    user_lookup_result.scalar_one_or_none.return_value = None
    mock_db_session.execute.return_value = user_lookup_result

    token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
    response = client.post(
        "/api/v1/seasons",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Spring Reads",
            "book_title": "Tomorrow",
            "book_author": "Gabrielle Zevin",
        },
    )

    assert response.status_code == 401
    assert response.headers["content-type"].startswith("application/problem+json")


def test_rejects_invalid_max_members_payload(client):
    token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
    response = client.post(
        "/api/v1/seasons",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Spring Reads",
            "book_title": "Tomorrow",
            "book_author": "Gabrielle Zevin",
            "max_members": 0,
        },
    )

    assert response.status_code == 422
    assert response.headers["content-type"].startswith("application/json")


def test_rejects_virtual_mode_without_location_url(client):
    token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
    response = client.post(
        "/api/v1/seasons",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Spring Reads",
            "book_title": "Tomorrow",
            "book_author": "Gabrielle Zevin",
            "location_mode": "virtual",
        },
    )

    assert response.status_code == 422
    assert response.headers["content-type"].startswith("application/json")


class TestSeasonScheduleEndpoint:
    def test_returns_401_when_missing_auth_header(self, client):
        response = client.patch(
            f"/api/v1/seasons/{SEASON_UUID}/schedule",
            json={
                "start_date": "2099-01-01T10:00:00Z",
                "duration_weeks": 10,
                "frequency": "weekly",
            },
        )
        assert response.status_code == 401

    def test_returns_403_for_non_creator(self, client, mock_db_session):
        season = MagicMock()
        season.created_by_user_id = uuid4()
        mock_db_session.get.return_value = season

        token = create_access_token({"sub": str(uuid4()), "email": "member@example.com"})
        response = client.patch(
            f"/api/v1/seasons/{SEASON_UUID}/schedule",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "start_date": "2099-01-01T10:00:00Z",
                "duration_weeks": 10,
                "frequency": "weekly",
            },
        )
        assert response.status_code == 403


@pytest.mark.asyncio
async def test_service_update_schedule_rejects_past_start_date():
    from app.schemas.season import SeasonScheduleRequest

    db = AsyncMock()
    user_id = uuid4()
    season = MagicMock()
    season.created_by_user_id = user_id
    db.get.return_value = season
    service = SeasonService(db)

    with pytest.raises(ValueError):
        await service.update_schedule(
            season_id=str(uuid4()),
            requester_user_id=str(user_id),
            payload=SeasonScheduleRequest(
                start_date="2000-01-01T10:00:00Z",
                duration_weeks=10,
                frequency="weekly",
                meetup_datetimes=None,
            ),
        )


@pytest.mark.asyncio
async def test_service_update_schedule_persists_manual_overrides_exactly():
    from app.schemas.season import SeasonScheduleRequest

    db = AsyncMock()
    user_id = uuid4()
    season_id = uuid4()
    season = MagicMock()
    season.created_by_user_id = user_id
    db.get.return_value = season
    service = SeasonService(db)

    payload = SeasonScheduleRequest(
        start_date="2099-01-01T10:00:00Z",
        duration_weeks=10,
        frequency="weekly",
        meetup_datetimes=["2099-01-03T10:00:00Z", "2099-01-10T11:00:00Z"],
    )

    result = await service.update_schedule(
        season_id=str(season_id),
        requester_user_id=str(user_id),
        payload=payload,
    )

    assert result is not None
    assert result.meetup_count == 2
    assert [dt.isoformat().replace("+00:00", "Z") for dt in result.meetup_datetimes] == [
        "2099-01-03T10:00:00Z",
        "2099-01-10T11:00:00Z",
    ]


@pytest.mark.asyncio
async def test_service_update_schedule_rolls_back_transaction_on_error():
    from app.schemas.season import SeasonScheduleRequest

    db = AsyncMock()
    user_id = uuid4()
    season_id = uuid4()
    season = MagicMock()
    season.created_by_user_id = user_id
    db.get.return_value = season
    db.execute.side_effect = SQLAlchemyError("db failure")

    service = SeasonService(db)
    payload = SeasonScheduleRequest(
        start_date="2099-01-01T10:00:00Z",
        duration_weeks=10,
        frequency="weekly",
    )

    with pytest.raises(SQLAlchemyError):
        await service.update_schedule(
            season_id=str(season_id),
            requester_user_id=str(user_id),
            payload=payload,
        )


@pytest.mark.asyncio
async def test_service_update_schedule_rejects_empty_manual_override_list():
    from app.schemas.season import SeasonScheduleRequest

    db = AsyncMock()
    user_id = uuid4()
    season = MagicMock()
    season.created_by_user_id = user_id
    db.get.return_value = season
    service = SeasonService(db)

    payload = SeasonScheduleRequest(
        start_date="2099-01-01T10:00:00Z",
        duration_weeks=10,
        frequency="weekly",
        meetup_datetimes=[],
    )

    with pytest.raises(ValueError, match="meetup_datetimes cannot be empty"):
        await service.update_schedule(
            season_id=str(uuid4()),
            requester_user_id=str(user_id),
            payload=payload,
        )


@pytest.mark.asyncio
async def test_service_update_schedule_rejects_duplicate_meetups():
    from app.schemas.season import SeasonScheduleRequest

    db = AsyncMock()
    user_id = uuid4()
    season = MagicMock()
    season.created_by_user_id = user_id
    db.get.return_value = season
    service = SeasonService(db)

    payload = SeasonScheduleRequest(
        start_date="2099-01-01T10:00:00Z",
        duration_weeks=10,
        frequency="weekly",
        meetup_datetimes=["2099-01-03T10:00:00Z", "2099-01-03T10:00:00Z"],
    )

    with pytest.raises(ValueError, match="meetup datetimes must be unique"):
        await service.update_schedule(
            season_id=str(uuid4()),
            requester_user_id=str(user_id),
            payload=payload,
        )


@pytest.mark.asyncio
async def test_service_update_schedule_rejects_invalid_requester_user_id():
    from app.schemas.season import SeasonScheduleRequest

    db = AsyncMock()
    service = SeasonService(db)
    payload = SeasonScheduleRequest(
        start_date="2099-01-01T10:00:00Z",
        duration_weeks=10,
        frequency="weekly",
    )

    with pytest.raises(ValueError, match="invalid requester_user_id"):
        await service.update_schedule(
            season_id=str(uuid4()),
            requester_user_id="not-a-uuid",
            payload=payload,
        )
