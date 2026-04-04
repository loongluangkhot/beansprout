# Beansprout Backend

FastAPI backend for the beansprout book club facilitation platform.

## Quick Start with uv

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create and activate virtual environment
uv sync

# Install dev dependencies
uv sync --extra dev

# Run the development server
uv run uvicorn app.main:app --reload --port 8000
```

## Using uv Commands

```bash
# Add a dependency
uv add fastapi pydantic

# Add a dev dependency
uv add --dev pytest pytest-asyncio

# Update dependencies
uv sync

# Run tests
uv run pytest

# Lock file update
uv lock
```

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI application
│   ├── config.py       # Configuration
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   ├── api/           # API endpoints
│   └── core/          # Security utilities
├── alembic/           # Database migrations
├── tests/             # Test suite
├── pyproject.toml    # Project config (uv)
└── requirements.txt   # Fallback pip deps
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/beansprout
SECRET_KEY=your-secret-key-change-in-production
CORS_ORIGINS=["http://localhost:3000"]
```
