"""
Season browse endpoint tests.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.main import app
from app.services.season_service import SeasonService


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
