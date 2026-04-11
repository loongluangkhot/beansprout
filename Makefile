.PHONY: db-up db-down db-logs db-reset migrate migrate-create backend frontend dev

db-up:
	docker compose up -d
	@echo "Waiting for database to be ready..."
	@until docker compose exec postgres pg_isready -U postgres -d beansprout > /dev/null 2>&1; do sleep 1; done
	@echo "Database is ready!"

db-down:
	docker compose down

db-logs:
	docker compose logs -f postgres

db-reset: db-down
	docker compose down -v
	docker compose up -d
	@echo "Waiting for database to be ready..."
	@until docker compose exec postgres pg_isready -U postgres -d beansprout > /dev/null 2>&1; do sleep 1; done
	@echo "Database is ready!"

migrate:
	cd backend && uv run alembic upgrade head

migrate-create:
ifndef MSG
	$(error MSG is undefined. Usage: make migrate-create MSG="your message")
endif
	cd backend && uv run alembic revision --autogenerate -m "$(MSG)"

backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

dev: db-up migrate
	@echo ""
	@echo "=========================================="
	@echo "Starting backend and frontend (Ctrl+C stops both)"
	@echo "=========================================="
	@echo ""
	@echo "  Backend:  http://localhost:8000"
	@echo "  Frontend: http://localhost:3000"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo ""
	@bash -c '(cd backend && uv run uvicorn app.main:app --reload --port 8000) & BACKEND_PID=$$!; \
		(cd frontend && npm run dev) & FRONTEND_PID=$$!; \
		trap "kill $$BACKEND_PID $$FRONTEND_PID 2>/dev/null; exit 130" INT TERM; \
		wait'
