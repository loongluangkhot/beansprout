# Story 3.6: close-season

Status: done

## Story

As a season creator,
I want to close my season to new members,
so that I can finalize the community.

## Acceptance Criteria

1. **Given** I am the creator of a published season **When** I click "Close to New Members" **Then** the season is marked as closed **And** new users cannot join.
2. **Given** I have closed a season **When** users view the season detail page **Then** they see "Season Closed" instead of "Join Season".
3. **Given** I have closed a season **When** I change my mind **Then** I can reopen the season to accept new members.
4. **Given** I have closed a season **When** I view the season management dashboard **Then** I see the status as "Closed".

## Tasks / Subtasks

- [x] Add backend close/reopen capability for creator-owned seasons (AC: 1, 3)
  - [x] Add endpoint(s) under existing seasons API (no new parallel resource) to toggle membership availability for a season.
  - [x] Enforce creator-only authorization server-side.
  - [x] Persist status transitions safely (`published` ↔ `closed`) and keep season public/discoverable behavior intentional.

- [x] Enforce join blocking for closed seasons (AC: 1, 2)
  - [x] Update join query/service logic so closed seasons cannot be joined by non-members.
  - [x] Return a consistent RFC7807 conflict response for closed-season join attempts.
  - [x] Ensure existing members retain member view behavior and upcoming meetups visibility.

- [x] Update season detail UX and creator actions (AC: 2, 3)
  - [x] Show "Season Closed" state for non-members when season is closed.
  - [x] Replace creator action label contextually: "Close to New Members" when published, "Reopen Season" when closed.
  - [x] Keep warm, non-judgmental copy and touch-friendly controls.

- [x] Update creator dashboard status rendering (AC: 4)
  - [x] Ensure `/seasons/manage` status badge maps backend `closed` status explicitly to "Closed".
  - [x] Preserve existing status mappings for `published` and other valid states.

- [x] Tests and regressions (AC: 1-4)
  - [x] Backend tests for close/reopen authorization, state transitions, and closed-join denial.
  - [x] Frontend tests for closed join label/state, creator reopen action visibility, and dashboard closed status.
  - [x] Regression tests for browse/detail/join flows from stories 2.1, 2.3, 2.5, and epic 3 create/publish flows.

### Review Findings

- [x] [Review][Patch] Hide closed seasons from public browse/detail endpoints for non-members (decision: option 2) [backend/app/services/season_service.py]
- [x] [Review][Patch] Restrict status transitions to valid lifecycle paths (prevent using this endpoint as a generic publish path; enforce only `published -> closed` and `closed -> published`) [backend/app/services/season_service.py]
- [x] [Review][Patch] Add missing status-endpoint tests (happy path close/reopen, not-found, invalid transition/status) [backend/tests/test_seasons.py]
- [x] [Review][Patch] Add user-visible error handling for close/reopen mutation failures [frontend/src/components/features/season/season-detail.tsx]
- [x] [Review][Patch] Add concurrency protection for status updates (row lock/version guard) [backend/app/services/season_service.py]

## Dev Notes

### Story Foundation & Business Context

- This story completes FR14 in Epic 3 by allowing creator-controlled closure of membership after publishing.
- Scope is membership availability control, not full archival/deletion lifecycle.

### Architecture Compliance (must follow)

- Backend: FastAPI + async SQLAlchemy + Pydantic v2.
- Frontend: Next.js App Router + React Query + Zustand auth store.
- API success shape remains `{data, meta}`; errors remain RFC7807 Problem Details.
- Preserve naming/structure conventions from architecture (`/api/v1/seasons/*`, feature-based files).

### Read-First UPDATE Files (non-negotiable)

- `backend/app/models/season.py`
  - Current state: `status` exists, default `draft`; story 3.5 sets newly created seasons to `published`.
  - Story change: add/confirm `closed` as valid runtime status without schema drift.
  - Preserve: existing indexes, columns, and created_by ownership model.

- `backend/app/services/season_service.py`
  - Current state: browse/detail/join require `status == "published"`; join uses SQL CTE with lock.
  - Story change: add close/reopen mutation and closed-aware join behavior.
  - Preserve: transaction safety, rollback behavior, and existing list/detail query contracts.

- `backend/app/api/v1/endpoints/seasons.py`
  - Current state: list/mine/detail/create/join/schedule only.
  - Story change: add creator-authorized close/reopen endpoint(s) and map errors consistently.
  - Preserve: auth extraction helpers and RFC7807 style.

- `backend/app/schemas/season.py`
  - Current state: creator dashboard and detail payloads include `status` (dashboard) and joinability booleans (detail).
  - Story change: ensure schemas cleanly represent closed status and any new mutation response.

- `frontend/src/components/features/season/season-detail.tsx`
  - Current state: join label = Joined/Season Full/Join Season; creator actions include a route stub for close.
  - Story change: wire actual close/reopen behavior and render "Season Closed" for non-members.
  - Preserve: login redirect flow, creator gating, and existing member/meetup sections.

- `frontend/src/app/(main)/seasons/manage/page.tsx`
  - Current state: dashboard lists creator seasons and status labels.
  - Story change: explicit closed badge/label mapping.

- `frontend/src/lib/api/seasons.ts` and `frontend/src/types/season.ts`
  - Add typed client function(s) for close/reopen mutation(s), reusing existing API client patterns.

### Reuse / Anti-Reinvention Guardrails

- Reuse `Season.status`; do **not** add duplicate booleans like `is_closed`.
- Reuse existing creator ownership (`created_by_user_id`) and auth helpers.
- Reuse current season detail query and React Query invalidation strategy; do not introduce parallel state stores.

### Security & Integrity Guardrails

- UI gating is insufficient alone; enforce creator-only close/reopen server-side.
- Prevent unauthorized toggles and invalid transitions (e.g., non-creator requests).
- Closed seasons must reject new joins deterministically under concurrency.

### UX Guardrails

- Non-member CTA text must be explicit: "Season Closed" (disabled action).
- Creator should get clear reversible control (close/reopen) with calm confirmation copy.
- Keep controls 44x44 minimum and preserve warm tone from UX spec.

### Previous Story Intelligence (3.5)

- Story 3.5 established creator management controls and `/seasons/mine`; extend those instead of creating new dashboard paradigms.
- Prior review patches emphasized:
  - strong regression tests around discoverability and creator APIs,
  - correct status-label mapping,
  - pagination/bounded queries in creator lists.
- Apply same rigor: explicit status mapping for `closed`, and tests for negative paths.

### Git Intelligence Summary

Recent commits (`9054f44`, `4b67d15`, `1f9a27a`) consistently modified this vertical slice:
- Backend: `models/season.py`, `schemas/season.py`, `services/season_service.py`, `api/v1/endpoints/seasons.py`, `tests/test_seasons.py`
- Frontend: `season-detail.tsx`, `seasons/manage/page.tsx`, `lib/api/seasons.ts`, `types/season.ts`, related tests

Follow the same file pattern for this story to stay coherent with established architecture.

### Latest Tech Information

- No framework upgrade required for this story.
- Continue with existing project stack and versions from architecture:
  - Next.js 15 + React 19 + TypeScript
  - FastAPI + Pydantic v2 + SQLAlchemy 2 async
  - React Query 5 + Zustand

### Testing Requirements (explicit)

- Backend
  - Creator can close published season.
  - Creator can reopen closed season.
  - Non-creator cannot close/reopen (403).
  - Joining closed season returns conflict/problem response.

- Frontend
  - Season detail shows disabled "Season Closed" for eligible non-members.
  - Creator sees correct toggle action label based on status.
  - Dashboard renders closed status correctly.

- Regression
  - Existing join behavior for published/open seasons unchanged.
  - Library/detail loading remains stable.

### Project Structure Notes

- Backend changes stay under:
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/app/services/season_service.py`
  - `backend/app/schemas/season.py`
  - `backend/tests/test_seasons.py`
- Frontend changes stay under:
  - `frontend/src/components/features/season/season-detail.tsx`
  - `frontend/src/app/(main)/seasons/manage/page.tsx`
  - `frontend/src/lib/api/seasons.ts`
  - `frontend/src/types/season.ts`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.6)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR14)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (stack, API contracts, project structure)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first, warm tone, touch targets)]
- [Source: `_bmad-output/implementation-artifacts/3-5-publish-season.md` (previous-story intelligence)]
- [Source: `backend/app/models/season.py`]
- [Source: `backend/app/schemas/season.py`]
- [Source: `backend/app/services/season_service.py`]
- [Source: `backend/app/api/v1/endpoints/seasons.py`]
- [Source: `frontend/src/components/features/season/season-detail.tsx`]
- [Source: `frontend/src/app/(main)/seasons/manage/page.tsx`]
- [Source: `frontend/src/lib/api/seasons.ts`]
- [Source: `frontend/src/types/season.ts`]

## Dev Agent Record

### Agent Model Used

openai/gpt-5-codex

### Debug Log References

- Resolved workflow customization via `_bmad/scripts/resolve_customization.py`.
- Auto-selected first backlog story from sprint status: `3-6-close-season`.
- Loaded and analyzed epics, PRD, architecture, UX, previous story, and relevant code files.

### Completion Notes List

- Added creator-only season status toggle endpoint: `PATCH /api/v1/seasons/{season_id}/status?season_status=closed|published`.
- Implemented backend service status transition logic (`published` ↔ `closed`) with authorization and transaction handling.
- Updated join flow to block non-members from joining closed seasons with RFC7807 `409 Conflict` (`Season is closed`).
- Updated season detail payload and UI to support closed state and show `Season Closed` CTA.
- Wired creator action button to toggle close/reopen directly from season detail.
- Kept creator dashboard status mapping consistent (`Closed` supported explicitly).
- Passed backend tests: `uv run pytest tests/test_seasons.py -q`.
- Passed frontend tests: `npm test -- --runInBand`.

### File List

- `_bmad-output/implementation-artifacts/3-6-close-season.md`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/schemas/season.py`
- `backend/app/services/season_service.py`
- `backend/tests/test_seasons.py`
- `frontend/src/components/features/season/season-detail.tsx`
- `frontend/src/components/features/season/season-detail.test.tsx`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/types/season.ts`

## Change Log

- 2026-05-16: Implemented Story 3.6, completed tests, and moved story to `review`.