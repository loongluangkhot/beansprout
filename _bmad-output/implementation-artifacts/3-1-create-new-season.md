# Story 3.1: create-new-season

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a logged-in user,
I want to create a new season with title, book, and description,
so that I can start a new book club.

## Acceptance Criteria

1. **Given** I am logged in and navigate to "Create Season" **When** I enter a season title **Then** the title is validated and accepted.
2. **Given** I am on the create season page **When** I enter the book title and author **Then** the book information is captured.
3. **Given** I am on the create season page **When** I add a book cover image **Then** the image is uploaded and displayed.
4. **Given** I am on the create season page **When** I enter a season description **Then** the description is captured for the season detail page.
5. **Given** I am on the create season page **When** I try to proceed without required fields **Then** I see validation errors **And** I cannot proceed until requirements are met.

## Tasks / Subtasks

- [x] Add backend create-season API contract and authenticated endpoint (AC: 1, 2, 4, 5)
  - [x] Add `POST /api/v1/seasons` in `backend/app/api/v1/endpoints/seasons.py` using existing auth extraction pattern.
  - [x] Return success with `{data, meta}` envelope and failures as RFC 7807 Problem Details.
  - [x] Reuse public-safe and consistent error handling style from existing season endpoints.
- [x] Implement create-season business logic in service layer (AC: 1, 2, 4, 5)
  - [x] Add `SeasonService.create_season(...)` in `backend/app/services/season_service.py`.
  - [x] Persist required fields (`title`, `book_title`, `book_author`) and optional fields (`description`, `cover_image_url`) to `seasons`.
  - [x] Set `created_by_user_id` from authenticated user and preserve architecture defaults (`status`, `is_public`) unless explicitly overridden by story requirements.
  - [x] Validate and normalize user input server-side (trim, non-empty required fields).
- [x] Add schema/types for create-season request and response (AC: 1, 2, 4, 5)
  - [x] Extend `backend/app/schemas/season.py` with create request/response models (Pydantic v2 style only).
  - [x] Extend `frontend/src/types/season.ts` and `frontend/src/lib/api/seasons.ts` with create-season request/response types and client.
- [x] Implement frontend create-season route and form UX (AC: 1, 2, 3, 4, 5)
  - [x] Create route page `frontend/src/app/(main)/seasons/create/page.tsx`.
  - [x] Add feature form component (recommended: `frontend/src/components/features/season/season-create-form.tsx`) using React Hook Form + Zod, following existing profile form conventions.
  - [x] Capture title, book title, author, description, and cover image input; show immediate validation feedback with warm, non-judgmental copy.
  - [x] On success, show confirmation and route user to an appropriate next step (season detail or draft management path, consistent with current app flow).
- [x] Implement cover image handling path for season creation (AC: 3)
  - [x] Reuse existing project file-upload pattern (do not invent a parallel upload stack).
  - [x] Ensure uploaded image is represented by `cover_image_url` in create payload/response and rendered in UI preview.
  - [x] Enforce safe and predictable constraints (image-only types, size cap, graceful fallback state).
- [x] Add tests and regression coverage (AC: 1-5)
  - [x] Backend tests in `backend/tests/test_seasons.py` for authenticated create success, unauthenticated rejection, and required-field validation errors.
  - [x] Frontend API tests in `frontend/src/lib/api/seasons.test.ts` for `createSeason` path, auth headers, and input guards.
  - [x] Frontend form tests (new file) for validation behavior and successful submit flow.
  - [x] Regression checks to ensure existing story 2.x read/join contracts remain unchanged.

### Review Findings

- [x] [Review][Patch] Cover image flow persists local blob URL instead of uploaded asset [frontend/src/components/features/season/season-create-form.tsx:983]
- [x] [Review][Patch] Preview object URLs are never revoked, risking browser memory leaks [frontend/src/components/features/season/season-create-form.tsx:983]
- [x] [Review][Patch] Create endpoint mixes validation/error contract paths for 422 responses [backend/app/api/v1/endpoints/seasons.py:75]
- [x] [Review][Patch] Create service does not roll back transaction on commit failures [backend/app/services/season_service.py:398]

## Dev Notes

### Developer Context Section

- Story 3.1 starts Epic 3 and should establish the canonical season-creation foundation that stories 3.2-3.6 build on.
- Epic 2 already delivered browse/detail/join behavior; this story must not regress those read/join contracts while adding creation capability.
- `Season` model already supports required data shape (`title`, `book_title`, `book_author`, `description`, `cover_image_url`, `created_by_user_id`, `status`, `is_public`), so avoid schema reinvention.
- Existing UI already links to `/seasons/create` from season library empty state; this story should implement that route rather than introducing alternate navigation.

### Technical Requirements

- Backend:
  - Add authenticated create endpoint in `backend/app/api/v1/endpoints/seasons.py`.
  - Keep endpoint transport thin and business logic in `SeasonService`.
  - Keep response envelopes as `{data, meta}` and error envelopes as RFC 7807 `application/problem+json`.
  - Use Pydantic v2 imports and model patterns only.
- Creation rules:
  - Auth required to create season.
  - Required fields: season title, book title, book author.
  - Optional fields: description, cover image URL (populated from upload flow).
  - Input validation must prevent blank required fields and return actionable errors.
  - Set `created_by_user_id` from auth token subject.
  - Do not alter legacy behavior of existing season browse/detail/join endpoints.
- Frontend:
  - Use React Hook Form + Zod for create form validation.
  - Use TanStack Query mutation for API submission and success/error handling.
  - Maintain warm, calm UX tone and mobile-first ergonomics.

### Architecture Compliance

- Keep feature boundaries intact:
  - Backend season work remains in `endpoints/seasons.py`, `services/season_service.py`, `schemas/season.py`.
  - Frontend season work remains in season route/components/api/types modules.
- Preserve naming and pattern standards from architecture:
  - DB/table/column snake_case and existing SQLAlchemy model conventions.
  - API path style under plural resource `/seasons`.
  - Success envelope `{data, meta}` and RFC 7807 error structure.
- Respect existing store/state patterns:
  - Auth from Zustand store.
  - Server state and mutations via TanStack Query.

### Library and Framework Requirements

- Frontend stack in repo:
  - Next.js `^15.0.0`, React `^19.0.0`, TypeScript.
  - React Hook Form `^7.50.0` + Zod `^3.22.0`.
  - TanStack Query `^5.100.1`.
- Backend stack in repo:
  - FastAPI (pyproject currently `>=0.109.0`) with Pydantic v2.
  - SQLAlchemy 2.x async patterns.
- Latest guidance to keep in mind:
  - Next.js upgrade tooling changed in 16.1+, but this codebase targets Next 15 patterns; avoid Next 16-specific APIs unless project is explicitly upgraded.
  - FastAPI migration guidance confirms avoiding `pydantic.v1` on modern Python tracks.
  - TanStack Query defaults still treat data as stale and retry failed queries; explicitly invalidate/refetch where needed after create.

### File Structure Requirements

- Expected backend touchpoints:
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/app/services/season_service.py`
  - `backend/app/schemas/season.py`
  - `backend/tests/test_seasons.py`
- Expected frontend touchpoints:
  - `frontend/src/app/(main)/seasons/create/page.tsx` (new)
  - `frontend/src/components/features/season/season-create-form.tsx` (new)
  - `frontend/src/components/features/season/season-create-form.test.tsx` (new)
  - `frontend/src/lib/api/seasons.ts`
  - `frontend/src/lib/api/seasons.test.ts`
  - `frontend/src/types/season.ts`
- Existing files read and current-state guidance:
  - `backend/app/api/v1/endpoints/seasons.py`
    - Current state: browse/detail/join endpoints with auth extraction helpers and RFC 7807 handling.
    - Story change: add authenticated create endpoint and preserve existing contracts.
    - Preserve: GET browse/detail and POST join behavior and status codes.
  - `backend/app/services/season_service.py`
    - Current state: season read/query logic and join transaction logic.
    - Story change: add create-season business method.
    - Preserve: existing browse/detail/join query behavior.
  - `backend/app/schemas/season.py`
    - Current state: browse/detail/join schemas.
    - Story change: add create request/response schemas without breaking existing models.
  - `backend/app/models/season.py`
    - Current state: canonical season persistence model already includes fields needed for story.
    - Story change: no model schema change expected unless required by implementation detail.
    - Preserve: defaults and indexes used by current stories.
  - `frontend/src/components/features/season/season-library.tsx`
    - Current state: empty-state CTA points to `/seasons/create`.
    - Story change: ensure CTA leads to functional create flow.
    - Preserve: browse/filter/infinite-load behavior.
  - `frontend/src/components/features/season/season-detail.tsx`
    - Current state: story 2.5 join states + member-only RSVP affordance.
    - Story change: none required directly for ACs unless routing success requires detail page display.
    - Preserve: join labels/states and member visibility logic.
  - `frontend/src/lib/api/seasons.ts`
    - Current state: browse, detail, join API helpers.
    - Story change: add create API helper with auth headers.
    - Preserve: existing signatures for prior stories.
  - `frontend/src/types/season.ts`
    - Current state: browse/detail/join types.
    - Story change: add create payload/response types only.
  - `frontend/src/components/features/profile/profile-form.tsx`
    - Current state: validated form pattern with React Hook Form + Zod.
    - Story change: use as implementation pattern reference for season create form.

### Testing Requirements

- Backend tests:
  - Authenticated create returns 201/200 per decided contract and expected `{data, meta}` shape.
  - Missing/invalid auth returns 401 Problem Details.
  - Missing required fields returns validation failure (422 or contract-defined problem response).
  - Service-level create path persists expected fields and creator id.
- Frontend tests:
  - Form validation blocks submit for missing required fields and shows clear errors.
  - Successful submit calls create API with normalized payload and handles success UX.
  - API client tests validate URL/path, method, and auth header usage.
- Regression tests:
  - Existing season browse/detail/join tests remain green.
  - Existing season detail rendering behavior (creator/members/meetups/join states) remains unchanged.

### Previous Story Intelligence

- Story 2.5 established core conventions to carry forward:
  - Keep season feature work localized (season endpoint/service/schema and season frontend modules).
  - Preserve RFC 7807 error consistency and `{data, meta}` response envelopes.
  - Maintain typed API contracts and query-key discipline.
  - Keep UX tone warm and action feedback explicit.

### Git Intelligence Summary

- Recent commits show vertical-slice delivery style by story with backend + frontend + tests in one scoped change.
- Recent sequence (`epic-2-4`, `epic-2-5`, auth redirect fix) indicates stable season module ownership and iterative enhancement without architecture reshuffles.
- Follow same approach: focused season-creation slice with aligned tests.

### Latest Tech Information

- Next.js docs (updated 2026-04-10) note `next upgrade` native command support in 16.1+, while this project currently uses Next 15 conventions.
- FastAPI migration docs emphasize moving fully to Pydantic v2 and avoiding long-term reliance on `pydantic.v1`.
- TanStack Query important defaults still include stale-by-default and retry behavior; post-create UI state should explicitly invalidate/refetch relevant queries.

### Project Structure Notes

- No architecture reshuffle required.
- This story should introduce creation capabilities through existing season feature boundaries and route conventions.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.1)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR9)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (API standards, stack, structure patterns)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first, warm copy, responsive and validation principles)]
- [Source: `backend/app/models/season.py` (season field model + defaults)]
- [Source: `backend/app/api/v1/endpoints/seasons.py` (existing endpoint and error patterns)]
- [Source: `backend/app/services/season_service.py` (service-layer and SQL patterns)]
- [Source: `frontend/src/components/features/profile/profile-form.tsx` (React Hook Form + Zod implementation pattern)]
- [Source: [Next.js Upgrading Guide](https://nextjs.org/docs/app/getting-started/upgrading)]
- [Source: [FastAPI Pydantic v2 Migration](https://fastapi.tiangolo.com/how-to/migrate-from-pydantic-v1-to-pydantic-v2/)]
- [Source: [TanStack Query Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)]

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Workflow skill: `.agents/skills/bmad-create-story/SKILL.md`
- Story template: `.agents/skills/bmad-create-story/template.md`
- Story checklist: `.agents/skills/bmad-create-story/checklist.md`
- Backend focused tests: `uv run pytest -q tests/test_seasons.py`
- Frontend focused tests: `npm test -- --runInBand src/lib/api/seasons.test.ts`
- Frontend form tests (new): `npm test -- --runInBand src/components/features/season/season-create-form.test.tsx`
- Frontend lint: `npm run lint`

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story selected from first backlog entry in sprint status: `3-1-create-new-season`.
- Epic, PRD, architecture, UX, existing implementation files, and latest technical docs analyzed.
- Identified required update files and likely new files to keep scope clear and avoid wheel reinvention.
- Guardrails added to preserve all Epic 2 discovery and join regressions while adding creation flow.
- Implemented authenticated `POST /api/v1/seasons` endpoint with `{data, meta}` success envelope and RFC 7807-style failures.
- Added `SeasonService.create_season(...)` with server-side normalization for required and optional input fields and creator association from auth.
- Added backend create schemas and frontend create types/client for typed request/response parity.
- Added create-season page and React Hook Form + Zod UX with warm validation copy, image preview, safe file constraints, and success redirect to season detail.
- Added focused backend and frontend tests for create flow plus full-suite regression validation.
- Validation executed: `uv run pytest -q` (82 passed), `npm test -- --runInBand` (60 passed), and `npm run lint` (passes with existing warning-only items).

### File List

- `_bmad-output/implementation-artifacts/3-1-create-new-season.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/services/season_service.py`
- `backend/app/schemas/season.py`
- `backend/tests/test_seasons.py`
- `frontend/src/app/(main)/seasons/create/page.tsx`
- `frontend/src/components/features/season/season-create-form.tsx`
- `frontend/src/components/features/season/season-create-form.test.tsx`
- `frontend/src/components/features/season/season-library.tsx`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/lib/api/seasons.test.ts`
- `frontend/src/types/season.ts`

## Change Log

- 2026-05-03: Created Story 3.1 implementation context and advanced status to `ready-for-dev`.
- 2026-05-03: Implemented Story 3.1 create-season vertical slice across backend, frontend, and tests; status moved to `review`.
