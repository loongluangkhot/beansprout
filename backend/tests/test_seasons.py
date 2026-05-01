"""
Season browse endpoint tests.
"""

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import get_db
from app.main import app
from app.services.season_service import SeasonService

SEASON_UUID = str(uuid4())


@pytest.fixture
def mock_db_session():
    session = AsyncMock()
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

    first_execute_call = db.execute.call_args_list[0]
    query_params = first_execute_call.args[1]

    assert query_params["search"] == "spring"
    assert query_params["genre"] == "Contemporary Fiction"
    assert query_params["schedule"] == "this-week"


class TestSeasonDetailEndpoint:
    def test_returns_season_detail_with_schedule_and_location(self, client, mock_db_session):
        detail_result = MagicMock()
        meetups_result = MagicMock()
        mock_db_session.execute.side_effect = [detail_result, meetups_result]

        detail_result.mappings.return_value.first.return_value = {
                "id": SEASON_UUID,
            "title": "Spring Reads",
            "theme": "Contemporary Fiction",
            "description": "A warm reading circle for reflective readers.",
            "book_title": "Tomorrow, and Tomorrow, and Tomorrow",
            "book_author": "Gabrielle Zevin",
            "cover_image_url": "https://example.com/cover.jpg",
            "member_count": 12,
            "location_name": "Bean & Leaf Cafe",
            "location_url": "https://maps.example.com/bean-leaf",
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

        response = client.get(f"/api/v1/seasons/{SEASON_UUID}")

        assert response.status_code == 200
        payload = response.json()
        assert payload["data"]["id"] == SEASON_UUID
        assert payload["data"]["location_name"] == "Bean & Leaf Cafe"
        assert payload["data"]["location_url"] == "https://maps.example.com/bean-leaf"
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

    def test_returns_problem_json_on_payload_validation_error(self, client, mock_db_session):
        detail_result = MagicMock()
        meetups_result = MagicMock()
        mock_db_session.execute.side_effect = [detail_result, meetups_result]

        detail_result.mappings.return_value.first.return_value = {
            "id": SEASON_UUID,
            "title": "Spring Reads",
            "theme": "Contemporary Fiction",
            "description": "A warm reading circle for reflective readers.",
            "book_title": "Tomorrow, and Tomorrow, and Tomorrow",
            "book_author": "Gabrielle Zevin",
            "cover_image_url": "https://example.com/cover.jpg",
            "member_count": 12,
            "location_name": "Bean & Leaf Cafe",
            "location_url": "https://maps.example.com/bean-leaf",
        }
        meetups_result.mappings.return_value.all.return_value = [
            {"id": "meetup-1", "starts_at": "not-a-datetime"}
        ]

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
    db.execute.side_effect = [detail_result, meetups_result]
    detail_result.mappings.return_value.first.return_value = {
        "id": SEASON_UUID,
        "title": "Spring Reads",
        "theme": "Contemporary Fiction",
        "description": "A warm reading circle",
        "book_title": "Tomorrow",
        "book_author": "Gabrielle Zevin",
        "cover_image_url": "https://example.com/cover.jpg",
        "location_name": "Bean & Leaf Cafe",
        "location_url": "https://maps.example.com/bean-leaf",
        "member_count": 5,
    }
    meetups_result.mappings.return_value.all.return_value = []

    service = SeasonService(db)
    await service.get_public_season_detail(SEASON_UUID)

    meetups_query = str(db.execute.call_args_list[1].args[0])
    assert "m.starts_at >= NOW()" in meetups_query
    assert "ORDER BY m.starts_at ASC" in meetups_query
