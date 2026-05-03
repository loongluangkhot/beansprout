# Story 3.2: set-season-schedule

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a season creator,
I want to set the season duration and meetup schedule,
so that members know when meetups will occur.

## Acceptance Criteria

1. **Given** I am in the schedule step of season creation **When** I set the season start date **Then** the start date is validated (must be in the future).
2. **Given** I am in the schedule step **When** I set the season duration (e.g., 10 weeks) **Then** the end date is calculated automatically.
3. **Given** I am in the schedule step **When** I set the meetup frequency (e.g., bi-weekly) **Then** all meetup dates are generated automatically.
4. **Given** I am in the schedule step **When** I set individual meetup dates and times **Then** the schedule is saved with those specific dates.
5. **Given** I am in the schedule step **When** I review the generated schedule **Then** I can edit individual meetup dates if needed.

## Tasks / Subtasks

- [x] Add backend schedule update API for season creators (AC: 1, 4, 5)
  - [x] Add authenticated endpoint (recommended: `PATCH /api/v1/seasons/{season_id}/schedule`) in `backend/app/api/v1/endpoints/seasons.py`.
  - [x] Restrict access to season creator only; return 403 RFC 7807 when requester is not creator.
  - [x] Preserve response envelope `{data, meta}` and RFC 7807 error contracts used in existing season endpoints.
- [x] Implement schedule business logic in service layer (AC: 1, 2, 3, 4, 5)
  - [x] Add service method (recommended: `SeasonService.update_schedule(...)`) in `backend/app/services/season_service.py`.
  - [x] Validate start date strictly in future (UTC-aware), duration bounds, and frequency enum.
  - [x] Generate meetup dates from start date + duration + frequency.
  - [x] Support manual override list for individual meetup datetime values.
  - [x] Persist schedule by replacing future meetups for the season in one transaction (no partial writes).
- [x] Add/extend backend schemas for schedule contract (AC: 1, 2, 3, 4, 5)
  - [x] Extend `backend/app/schemas/season.py` with schedule request/response models and validators.
  - [x] Keep Pydantic v2 style and normalize trimmed inputs where relevant.
- [x] Extend frontend API/types for schedule updates (AC: 1, 4, 5)
  - [x] Extend `frontend/src/types/season.ts` with schedule payload/response types.
  - [x] Extend `frontend/src/lib/api/seasons.ts` with schedule update client using auth headers.
- [x] Implement schedule step UI in create-season flow (AC: 1, 2, 3, 4, 5)
  - [x] Add schedule controls to `frontend/src/components/features/season/season-create-form.tsx` (or a nested feature component used by it) without breaking existing Story 3.1 fields.
  - [x] Include: future start date picker, duration input, frequency selector (weekly/bi-weekly/monthly), generated meetup preview.
  - [x] Allow editing/removing individual generated meetup rows and adding manual rows.
  - [x] Keep mobile-first layout, warm tone copy, and one-thumb operability.
- [x] Save schedule after season creation (AC: 4)
  - [x] Ensure season create + schedule save sequence is deterministic: create season first, then schedule update for returned `season_id`.
  - [x] Show clear success/error feedback if schedule persistence fails after season creation.
- [x] Add tests and regression coverage (AC: 1-5)
  - [x] Backend tests in `backend/tests/test_seasons.py` for auth, creator authorization, future-date validation, generation logic, manual override persistence, and transactional behavior.
  - [x] Frontend API tests in `frontend/src/lib/api/seasons.test.ts` for schedule endpoint path/method/auth and payload guards.
  - [x] Frontend form/component tests (new file recommended) for generation, edit behavior, and submit flow.
  - [x] Regression checks that Story 2.x browse/detail/join and Story 3.1 create-season base flow remain unchanged.

### Review Findings

- [x] [Review][Patch] Off-by-one meetup generation can over-schedule occurrences [backend/app/services/season_service.py:457]
- [x] [Review][Patch] Invalid UUID in auth subject can cause unhandled create flow error [backend/app/services/season_service.py:399]
- [x] [Review][Patch] Schedule update misclassifies invalid identifiers as season-not-found [backend/app/services/season_service.py:428]
- [x] [Review][Patch] Empty manual override list allows zero-meetup schedule persistence [backend/app/services/season_service.py:462]
- [x] [Review][Patch] Duplicate manual meetup timestamps are accepted without validation [backend/app/services/season_service.py:463]
- [x] [Review][Patch] Create-season CTA uses nested interactive elements (`Button` + `Link`) [frontend/src/components/features/season/season-library.tsx:162]
- [x] [Review][Patch] Schedule step lacks explicit client-side future-date validation feedback [frontend/src/components/features/season/season-create-form.tsx:1682]
- [x] [Review][Patch] Form tests miss generation and edit/remove/add schedule behavior coverage [frontend/src/components/features/season/season-create-form.test.tsx:93]
- [x] [Review][Patch] Date conversion between `datetime-local` and UTC can shift intended meetup times [frontend/src/components/features/season/season-create-form.tsx:1747]

## Dev Notes

### Developer Context Section

- Story 3.2 builds directly on Story 3.1's create-season vertical slice and must not regress working creation, browse, detail, and join behavior.
- Existing backend already has `Season` + `Meetup` models and season CRUD/read paths; schedule should be implemented as a focused extension rather than a parallel workflow.
- Existing create page and form are in place; story work should evolve this flow into a schedule-capable experience without splitting users into inconsistent routes.

### Technical Requirements

- Scheduling domain rules for this story:
  - `start_date` must be future datetime (timezone-aware; normalize to UTC in backend).
  - `duration_weeks` must be positive and bounded for MVP safety (recommended 1-52).
  - `frequency` enum should be explicit and constrained (recommended: `weekly`, `bi-weekly`, `monthly`).
  - Auto-generated meetup datetimes must stay within season duration window.
  - Manual overrides can adjust generated dates/times; final persisted schedule reflects edited list.
- Ownership/security rules:
  - Only authenticated season creator can write schedule for a season.
  - Unauthorized users receive RFC 7807 401/403 responses.
- Persistence rules:
  - Use one transaction to replace/update upcoming meetups to avoid mixed state.
  - On failure, rollback fully.

### Architecture Compliance

- Keep all season-domain write behavior in:
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/app/services/season_service.py`
  - `backend/app/schemas/season.py`
- Continue existing architecture patterns:
  - API success envelope `{data, meta}`
  - RFC 7807 Problem Details for errors
  - Pydantic v2 validators and SQLAlchemy async transaction handling
- Frontend consistency:
  - API clients in `frontend/src/lib/api/*`
  - Domain types in `frontend/src/types/*`
  - Form state with React Hook Form + Zod
  - Server state/mutations with TanStack Query

### Library and Framework Requirements

- Frontend:
  - Next.js 15 + React 19 + TypeScript
  - React Hook Form + Zod for validation
  - TanStack Query for mutation sequencing and invalidation
- Backend:
  - FastAPI + Pydantic v2
  - SQLAlchemy async with PostgreSQL
- Date/time handling:
  - ISO 8601 UTC payload format for all meetup datetimes
  - Avoid local-only time assumptions in backend validation

### File Structure Requirements

- Expected backend updates:
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/app/services/season_service.py`
  - `backend/app/schemas/season.py`
  - `backend/tests/test_seasons.py`
- Expected frontend updates:
  - `frontend/src/components/features/season/season-create-form.tsx`
  - `frontend/src/lib/api/seasons.ts`
  - `frontend/src/lib/api/seasons.test.ts`
  - `frontend/src/types/season.ts`
  - `frontend/src/components/features/season/season-create-form.schedule.test.tsx` (new, recommended)
- Existing file behaviors to preserve:
  - `backend/app/api/v1/endpoints/seasons.py`: browse/detail/create/join contracts and status code semantics.
  - `backend/app/services/season_service.py`: public season listing/detail/join behavior.
  - `frontend/src/components/features/season/season-create-form.tsx`: existing Story 3.1 validation and create submission baseline.
  - `frontend/src/lib/api/seasons.ts`: existing get/detail/join/create helpers and input guards.
  - `frontend/src/types/season.ts`: existing browse/detail/join/create interfaces.

### Testing Requirements

- Backend tests must prove:
  - Future start-date validation fails for past dates.
  - Duration/frequency validation and generated count/dates are correct.
  - Manual override list persists exact chosen values.
  - Non-creator cannot update schedule.
  - Transaction rolls back on persistence error.
- Frontend tests must prove:
  - Schedule generation reacts correctly to start date + duration + frequency.
  - User can edit/remove/add meetup rows before submit.
  - Submit flow calls create API then schedule API in correct order.
  - Error messaging remains clear and non-judgmental.
- Regression tests:
  - Existing Story 2.x and Story 3.1 tests remain green.

### Previous Story Intelligence

- Story 3.1 established:
  - Authenticated season creation endpoint and service layer patterns.
  - Existing create-season route and form with React Hook Form + Zod.
  - Strict `{data, meta}` and RFC 7807 transport expectations.
- Reuse these directly; do not introduce a second create-season implementation path.

### Git Intelligence Summary

- Recent implementation style is vertical-slice by story with backend + frontend + tests in one change.
- Season feature ownership is stable across `seasons.py`, `season_service.py`, `season.ts`, and season feature components.
- Keep Story 3.2 similarly focused to reduce merge and regression risk.

### Latest Tech Information

- No stack upgrade is required for this story.
- Continue current Next.js 15 / React 19 conventions in this repo.
- Continue FastAPI + Pydantic v2 and TanStack Query v5 patterns already in use.

### Project Structure Notes

- This story should extend existing season creation flow and backend season domain modules.
- Avoid introducing separate scheduling routes/pages unless required by existing app patterns discovered during implementation.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.2)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR10 and related MVP constraints)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (stack, patterns, API envelopes, project structure)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first, warm tone, one-tap/low-friction behavior)]
- [Source: `_bmad-output/implementation-artifacts/3-1-create-new-season.md` (prior story learnings and conventions)]
- [Source: `backend/app/models/season.py`]
- [Source: `backend/app/models/meetup.py`]
- [Source: `backend/app/api/v1/endpoints/seasons.py`]
- [Source: `backend/app/services/season_service.py`]
- [Source: `backend/app/schemas/season.py`]
- [Source: `frontend/src/components/features/season/season-create-form.tsx`]
- [Source: `frontend/src/lib/api/seasons.ts`]
- [Source: `frontend/src/types/season.ts`]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Resolved workflow: `python3 _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-create-story --key workflow`
- Loaded sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Loaded planning artifacts: `_bmad-output/planning-artifacts/epics.md`, `_bmad-output/planning-artifacts/prd.md`, `_bmad-output/planning-artifacts/architecture.md`, `_bmad-output/planning-artifacts/ux-design-specification.md`
- Loaded previous story: `_bmad-output/implementation-artifacts/3-1-create-new-season.md`
- Updated sprint status to in-progress and selected story `3-2-set-season-schedule`
- Implemented backend schedule endpoint, service, and schemas
- Implemented frontend schedule API/types and create-season schedule UI flow
- Ran frontend tests and lint checks

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Selected first backlog story in sprint order: `3-2-set-season-schedule`.
- Extracted implementation guardrails from epics, PRD, architecture, UX, previous story learnings, and current code structure.
- Added explicit anti-regression constraints and deterministic create-then-schedule sequencing guidance.
- Added `PATCH /api/v1/seasons/{season_id}/schedule` with auth + creator-only authorization and RFC 7807 errors.
- Added `SeasonService.update_schedule(...)` with future-date validation, bounded duration, cadence generation, manual override support, and transactional persistence for future meetups.
- Extended schedule request/response contracts in backend and frontend types.
- Extended create-season UI with schedule controls, generated preview, manual edits/removals/additions, and deterministic create-then-schedule submit sequence.
- Added/updated tests for backend schedule behavior and frontend API/form behavior.
- Frontend regression suite passes (`npm test -- --runInBand`); backend tests could not run in this environment because `pytest` is not installed.

### File List

- `_bmad-output/implementation-artifacts/3-2-set-season-schedule.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/services/season_service.py`
- `backend/app/schemas/season.py`
- `backend/tests/test_seasons.py`
- `frontend/src/types/season.ts`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/lib/api/seasons.test.ts`
- `frontend/src/components/features/season/season-create-form.tsx`
- `frontend/src/components/features/season/season-create-form.test.tsx`

## Change Log

- 2026-05-03: Created Story 3.2 implementation context and advanced status to `ready-for-dev`.
- 2026-05-03: Implemented Story 3.2 schedule backend/frontend functionality and moved status to `review`.
