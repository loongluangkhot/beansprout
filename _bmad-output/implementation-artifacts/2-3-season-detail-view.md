# Story 2.3: season-detail-view

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to view detailed season information,
so that I can evaluate whether to join.

## Acceptance Criteria

1. **Given** I am browsing the season library **When** I tap on a season card **Then** I navigate to the season detail page **And** I see the full book information (title, author, cover image).
2. **Given** I am on the season detail page **When** the page loads **Then** I see the season description, schedule, location, and member count.
3. **Given** I am on the season detail page **When** I scroll down **Then** I see upcoming meetups with dates and times.
4. **Given** I am on the season detail page **When** I view the schedule **Then** I see all meetup dates and times for the season.
5. **Given** I am on the season detail page **When** I view the location **Then** I see the venue name and a link (URL) to the location.

## Tasks / Subtasks

- [x] Add backend season-detail read endpoint and response schema (AC: 1, 2, 3, 4, 5)
  - [x] Implement `GET /api/v1/seasons/{season_id}` in `backend/app/api/v1/endpoints/seasons.py`.
  - [x] Extend `backend/app/services/season_service.py` with a detail query that returns season core fields + meetup list.
  - [x] Return `{data, meta}` envelope for success and RFC 7807 payloads for error conditions.
  - [x] Include consistent sorting of meetups (earliest upcoming first).
- [x] Build season detail page UI in frontend (AC: 1, 2, 3, 4, 5)
  - [x] Create route page at `frontend/src/app/(main)/seasons/[seasonId]/page.tsx`.
  - [x] Add feature component(s) under `frontend/src/components/features/season/` for detail rendering.
  - [x] Show title, author, cover image, theme, description, member count, location name/link, and schedule list.
  - [x] Handle missing optional fields gracefully with warm fallback copy.
- [x] Preserve and extend navigation flow from season library (AC: 1)
  - [x] Keep `SeasonCard` link behavior and ensure route param compatibility.
  - [x] Ensure keyboard/touch activation opens detail view consistently.
- [x] Add loading, empty, and error UX states aligned to design system (AC: 2, 3, 4, 5)
  - [x] Show skeletons while loading.
  - [x] Show friendly, actionable error state for unavailable season.
  - [x] Keep tone consistent with "safe, warm, non-judgmental" UX copy.
- [x] Add tests for backend + frontend behavior (AC: 1, 2, 3, 4, 5)
  - [x] Backend tests for found/not-found season detail, response shape, meetup ordering, location link fields.
  - [x] Frontend tests for route render, loading state, detail content, and graceful missing-field fallback.
  - [x] Regression test that season library navigation and list behavior remain intact.

### Review Findings

- [x] [Review][Decision] Clarify `season_id` format contract at API boundary — Enforced UUID path validation at endpoint boundary.
- [x] [Review][Patch] Encode `seasonId` path parameter in frontend API client [`frontend/src/lib/api/seasons.ts:47`]
- [x] [Review][Patch] Reject empty/whitespace `seasonId` in frontend API client to avoid hitting browse route shape [`frontend/src/lib/api/seasons.ts:47`]
- [x] [Review][Patch] Add backend test coverage for problem+json 500 error paths (DB/validation branches) [`backend/tests/test_seasons.py:106`]
- [x] [Review][Patch] Add explicit meetup ordering and time-boundary assertions in tests [`backend/tests/test_seasons.py:124`]

## Dev Notes

### Developer Context Section

- Story 2.3 is a direct continuation of Story 2.1 and Story 2.2 season discovery flow.
- Reuse the current season browse data contract and component patterns; do not introduce parallel season domain models unless required.
- This page is a decision surface for Story 2.5 (join flow), so data fidelity and layout clarity matter more than visual complexity.
- Keep the experience mobile-first and one-handed friendly per UX requirements.

### Technical Requirements

- Backend:
  - Add detail endpoint under existing seasons router: `GET /api/v1/seasons/{season_id}`.
  - Validate `season_id` format consistently with existing ID strategy.
  - Return season detail payload including:
    - season core: `id`, `title`, `theme`, `description`
    - book: `book_title`, `book_author`, `cover_image_url`
    - participation: `member_count`
    - location: `location_name`, `location_url` (or equivalent persisted fields)
    - schedule: list of upcoming meetups with `id`, `starts_at` (and existing relevant fields)
  - Use deterministic meetup ordering (`starts_at ASC`) and explicit timezone-safe formatting.
- Frontend:
  - Use React Query for detail fetch (`useQuery`) with query key including `seasonId`.
  - Keep API client in `frontend/src/lib/api/seasons.ts`.
  - Extend `frontend/src/types/season.ts` with detail types; avoid ad-hoc inline types in components.
  - Preserve current browse route and card link navigation semantics.

### Architecture Compliance

- Keep file ownership aligned with architecture:
  - API endpoint: `backend/app/api/v1/endpoints/seasons.py`
  - Business logic: `backend/app/services/season_service.py`
  - Schemas/contracts: `backend/app/schemas/season.py`
  - Frontend route: `frontend/src/app/(main)/seasons/[seasonId]/page.tsx`
  - Feature components: `frontend/src/components/features/season/*`
  - Typed API client: `frontend/src/lib/api/seasons.ts`
- Keep API style and error handling conventions:
  - success envelope `{data, meta}`
  - error format RFC 7807 (`application/problem+json`)
- Do not move season code outside `season` feature boundaries.

### Library and Framework Requirements

- Next.js App Router (15.x) and React 19 patterns in existing codebase.
- TanStack Query v5 for frontend server-state:
  - query keys must include dynamic params (e.g., `["season-detail", seasonId]`)
  - rely on stale defaults intentionally; only tune `staleTime` if justified
- FastAPI + Pydantic v2 patterns:
  - continue using `model_validate` / `model_dump` style serialization
  - avoid `pydantic.v1` compatibility usage for new code
- SQL query behavior:
  - keep async SQLAlchemy patterns used in current `SeasonService`.

### File Structure Requirements

- Expected backend files:
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/app/services/season_service.py`
  - `backend/app/schemas/season.py`
  - `backend/tests/test_seasons.py`
- Expected frontend files:
  - `frontend/src/app/(main)/seasons/[seasonId]/page.tsx` (new)
  - `frontend/src/components/features/season/season-detail.tsx` (new or equivalent split components)
  - `frontend/src/lib/api/seasons.ts`
  - `frontend/src/types/season.ts`
  - `frontend/src/components/features/season/season-card.tsx` (verify compatibility only)
  - `frontend/src/components/features/season/*.test.tsx` for detail tests

### Files Read (Current State, Change Surface, Preserve Rules)

- `frontend/src/components/features/season/season-card.tsx`
  - Current state: card links to `/seasons/${season.id}` and displays summary metadata.
  - Story change: preserve this route target and ensure detail route supports it.
  - Must preserve: accessible link/focus styles and current card visual tone.
- `frontend/src/components/features/season/season-library.tsx`
  - Current state: list with filters, infinite loading, empty/error handling.
  - Story change: no behavior rewrite required; only ensure navigation path remains valid.
  - Must preserve: filters, loading skeletons, and no-results handling from Story 2.2.
- `backend/app/api/v1/endpoints/seasons.py`
  - Current state: `GET /seasons` browse endpoint with pagination/filtering and RFC 7807 errors.
  - Story change: add `GET /seasons/{season_id}` with same response/error conventions.
  - Must preserve: existing browse endpoint behavior and filter contract.
- `backend/app/services/season_service.py`
  - Current state: browse query with filtering and deterministic ordering.
  - Story change: add detail retrieval logic and meetup ordering.
  - Must preserve: existing browse query outputs and pagination behavior.
- `backend/app/schemas/season.py`
  - Current state: browse schemas and response envelope helpers.
  - Story change: add detail-oriented schema models without breaking browse models.
  - Must preserve: existing browse schema contract currently used by frontend.
- `frontend/src/lib/api/seasons.ts` and `frontend/src/types/season.ts`
  - Current state: browse API + filter types.
  - Story change: extend with season-detail request/response types.
  - Must preserve: existing `getSeasons()` signature and usage.

### Testing Requirements

- Backend:
  - `GET /api/v1/seasons/{season_id}` returns 200 with expected detail payload and valid `meta`.
  - Not-found season returns RFC 7807 404 payload (not generic 500).
  - Meetups in response are sorted chronologically.
  - Browse endpoint tests remain green (Story 2.2 regression guard).
- Frontend:
  - Route `/seasons/[seasonId]` renders loading state then detail content.
  - Displays required fields from ACs (book info, description, schedule, location link, member count).
  - Handles missing optional values with clear fallback messaging.
  - Navigation from season card continues to work.

### Previous Story Intelligence

- Story 2.2 established:
  - additive endpoint evolution under existing seasons API surface,
  - React Query + typed API client patterns,
  - warm no-results/error UX copy conventions.
- Carry-forward guardrails:
  - do not fork API patterns,
  - keep type definitions centralized,
  - preserve list experience while adding detail route.

### Git Intelligence Summary

- Recent commits show Epic 2 delivery cadence and reinforce current patterns in season flow.
- Existing conventions: feature-oriented frontend structure, typed contracts, and backend tests under `backend/tests`.
- Keep changes scoped to season detail capability to avoid unrelated churn.

### Latest Tech Information

- Next.js v15 docs and upgrade guide confirm `fetch` is not cached by default; if server component fetches are introduced, explicitly choose caching behavior where needed for season freshness.
- FastAPI migration guidance confirms modern Pydantic v2 patterns should be used for new models/serialization.
- TanStack Query v5 guidance emphasizes query keys must encode variables to avoid stale cache collisions.

### Project Structure Notes

- This story fits existing architecture without restructuring.
- New UI should remain in `frontend/src/components/features/season`.
- API detail endpoint should remain in existing seasons endpoint/service/schema files.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.3)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR7 season detail requirements)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (stack + API + structure standards)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first, warm tone, one-handed interactions)]
- [Source: `_bmad-output/implementation-artifacts/2-2-season-search-filter.md` (previous story patterns and lessons)]
- [Source: [Next.js v15 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15)]
- [Source: [Next.js fetch API reference](https://nextjs.org/docs/app/api-reference/functions/fetch)]
- [Source: [FastAPI Pydantic v2 migration guide](https://fastapi.tiangolo.com/how-to/migrate-from-pydantic-v1-to-pydantic-v2/)]
- [Source: [TanStack Query v5 important defaults](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults)]

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Workflow skill: `.agents/skills/bmad-create-story/SKILL.md`
- Story template: `.agents/skills/bmad-create-story/template.md`
- Story checklist: `.agents/skills/bmad-create-story/checklist.md`
- Backend tests: `uv run pytest -q tests/test_seasons.py` and `uv run pytest -q`
- Frontend tests: `npm test -- --runInBand`
- Frontend lint: `npm run lint`

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story selected from first backlog entry in sprint status: `2-3-season-detail-view`.
- Epic, architecture, UX, previous story, and current implementation files analyzed before drafting.
- Latest framework guidance incorporated for Next.js v15 caching behavior, FastAPI/Pydantic v2, and React Query key hygiene.
- Story finalized with status `ready-for-dev`.
- Implemented backend season detail endpoint with `{data, meta}` response and RFC 7807 not-found/error handling.
- Implemented season detail service query for core season data, location fields, and chronologically ordered upcoming meetups.
- Added frontend season detail route and feature component with loading, error, and warm fallback states.
- Added API client/type support for season detail and comprehensive unit tests for backend and frontend detail flows.
- Verified regressions: backend `64 passed`; frontend `41 passed`; lint passes with pre-existing warnings.

### File List

- `_bmad-output/implementation-artifacts/2-3-season-detail-view.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/schemas/season.py`
- `backend/app/services/season_service.py`
- `backend/tests/test_seasons.py`
- `frontend/src/app/(main)/seasons/[seasonId]/page.tsx`
- `frontend/src/components/features/season/season-detail.tsx`
- `frontend/src/components/features/season/season-detail.test.tsx`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/types/season.ts`

## Change Log

- 2026-05-01: Implemented Story 2.3 season detail backend/frontend, added tests, and advanced status to `review`.
