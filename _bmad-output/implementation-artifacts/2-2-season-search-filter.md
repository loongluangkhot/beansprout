# Story 2.2: season-search-filter

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to search and filter seasons by theme, genre, or schedule,
so that I can find seasons that match my specific interests.

## Acceptance Criteria

1. **Given** I am on the season library page **When** I enter a search term in the search bar **Then** I see seasons matching that search term (title, book, theme).
2. **Given** I am on the season library page **When** I select a genre filter (e.g., "Contemporary Fiction") **Then** I see only seasons matching that genre.
3. **Given** I am on the season library page **When** I select a schedule filter (e.g., "This Week") **Then** I see only seasons with meetups happening this week.
4. **Given** I am on the season library page **When** I apply multiple filters (search + genre + schedule) **Then** I see seasons matching ALL selected criteria.
5. **Given** I am on the season library page **When** no seasons match my search/filters **Then** I see a "no results" message **And** I'm offered to adjust or clear filters.

## Tasks / Subtasks

- [x] Build backend filtering support on season browse endpoint (AC: 1, 2, 3, 4)
  - [x] Extend `GET /api/v1/seasons` query params to accept `search`, `genre`, and `schedule`.
  - [x] Implement case-insensitive search across season title, book title, and theme.
  - [x] Implement genre filtering using canonical genre values used by season data.
  - [x] Implement schedule filter logic for "This Week" based on upcoming meetup datetime range.
  - [x] Ensure combined filters are applied with AND semantics.
- [x] Keep backend contract stable and paginated (AC: 1, 4, 5)
  - [x] Preserve `{data, meta}` response envelope and pagination metadata.
  - [x] Keep sorting deterministic for filtered results (nearest upcoming meetup first).
  - [x] Return empty `data` with valid `meta` when no matches exist.
- [x] Implement frontend search and filter controls (AC: 1, 2, 3, 4, 5)
  - [x] Add search input and filter controls to season library UI.
  - [x] Wire filter state to API params through React Query.
  - [x] Reset pagination and refetch when search/filter criteria change.
  - [x] Add visible "clear filters" affordance in no-results state.
- [x] Ensure mobile-first UX and accessibility for filtering interactions (AC: 1, 2, 3, 5)
  - [x] Keep controls one-handed and touch target compliant (>=44x44).
  - [x] Show loading skeletons during refetch and fetch-next-page states.
  - [x] Keep warm, non-judgmental copy for no-results guidance.
- [x] Add comprehensive tests for search/filter behavior (AC: 1, 2, 3, 4, 5)
  - [x] Backend tests: search, genre, schedule, combined filters, and no-results response.
  - [x] Frontend tests: control interactions, query param propagation, no-results + clear action.
  - [x] Regression tests: existing Story 2.1 browse behavior still passes with no filters.

### Review Findings

- [x] [Review][Patch] Story acceptance criteria not implemented in reviewed diff [`backend/app/api/v1/router.py:9`]
- [x] [Review][Patch] Season search/filter frontend and API contract changes missing in reviewed diff [`frontend/src/app/layout.tsx:9`]
- [x] [Review][Patch] Story-specific season filtering tests absent from reviewed diff [`backend/tests/test_profile.py:1`]
- [x] [Review][Patch] Unhandled non-DB exception path on exposed seasons endpoint [`backend/app/api/v1/endpoints/seasons.py:49`]
- [x] [Review][Patch] Unused import after test assertion refactor [`backend/tests/test_profile_photo.py:14`]

## Dev Notes

### Developer Context Section

- Story 2.2 extends Story 2.1 season library browse; treat the existing season list API and UI as the baseline to evolve, not replace.
- Business goal is precision discovery: users should narrow to relevant seasons quickly by combining free-text search with genre and schedule filters.
- Keep behavior predictable: applying filters should immediately reflect in results and retain stable sorting by nearest upcoming meetup.
- "No results" is a first-class state, not an error state; guide users to refine or clear filters with supportive copy.
- This story is a dependency enabler for Story 2.3 (detail-view intent) and Story 2.5 (join intent), so filter outputs must stay contract-compatible.
- Current working tree already includes in-progress Epic 2 season files; avoid reorganizing unrelated structures and layer this work on established patterns.

### Technical Requirements

- Backend endpoint remains `GET /api/v1/seasons` and continues to support pagination; add optional query parameters without breaking existing callers.
- Query contract to support:
  - `search` (string): case-insensitive partial match against season title, book title, and season theme.
  - `genre` (string): exact/canonical genre match (normalized for case/spacing as needed by existing data conventions).
  - `schedule` (string enum for MVP): includes at minimum `this-week`.
- Combined filtering semantics must be logical AND across all active criteria.
- Schedule filtering should be based on upcoming meetup datetime windows (current week boundaries) and operate in consistent server-side time logic.
- Response envelope must remain `{data, meta}` for success and maintain RFC 7807 for error responses.
- Filtered results must preserve deterministic sorting (nearest upcoming meetup first, then stable tie-break).
- Empty matches must return `data: []` plus valid `meta` (not a 404).

### Architecture Compliance

- Keep backend implementation split across:
  - endpoint layer: `backend/app/api/v1/endpoints/seasons.py`
  - business logic: `backend/app/services/season_service.py`
  - schemas/contracts: `backend/app/schemas/season.py`
- Keep frontend implementation split across:
  - route/page composition: `frontend/src/app/(main)/seasons/page.tsx`
  - feature UI: `frontend/src/components/features/season/*`
  - API client: `frontend/src/lib/api/seasons.ts`
  - shared types: `frontend/src/types/season.ts`
- Maintain API naming and query conventions from architecture:
  - route path pluralized and kebab-style
  - query parameter names in snake_case where applicable
- Continue using React Query for server state and avoid introducing alternative fetch/state patterns.
- Preserve error format conventions (RFC 7807) and do not add ad-hoc error envelopes.

### Library and Framework Requirements

- Frontend stack assumptions:
  - Next.js 15 App Router
  - React 19
  - TypeScript with strict shared contracts from `frontend/src/types`
- Backend stack assumptions:
  - FastAPI with async service flow
  - SQLAlchemy 2.x async patterns
  - Pydantic v2 model style
- React Query requirements:
  - Use query keys that include search/filter values to avoid stale or mixed datasets.
  - Reset infinite pagination cursor/page chain when filter criteria change.
  - Keep loading states for both initial load and incremental page fetches.
- Next.js 15 considerations:
  - Be explicit about caching/revalidation behavior where route/data-fetch defaults could cause stale filtered results.
- FastAPI/Pydantic requirements:
  - Keep request parsing and response serialization in v2 idioms (`model_validate`, `model_dump` family where relevant).
  - Avoid `pydantic.v1` compatibility imports for new code unless already required in adjacent module patterns.

### File Structure Requirements

- Backend expected touch points:
  - `backend/app/api/v1/endpoints/seasons.py` for query params and endpoint wiring.
  - `backend/app/services/season_service.py` for filter composition and query behavior.
  - `backend/app/schemas/season.py` for request/response schema updates if needed.
  - `backend/tests/test_seasons.py` for backend filter behavior verification.
- Frontend expected touch points:
  - `frontend/src/components/features/season/season-library.tsx` for search/filter controls and state wiring.
  - `frontend/src/lib/api/seasons.ts` for API client query parameter support.
  - `frontend/src/types/season.ts` for any updated contracts.
  - `frontend/src/components/features/season/season-library.test.tsx` for UI/filter tests.
- Do not move season feature code into auth/profile folders; keep Epic 2 work inside `season` feature modules.
- Keep shared provider wiring (for React Query) unchanged unless this story explicitly requires a bug fix.

### Testing Requirements

- Backend test expectations:
  - Search term returns matches from title/book/theme fields.
  - Genre filter returns only matching genres.
  - Schedule filter (`this-week`) returns only seasons with upcoming meetups in current week window.
  - Combined filters apply AND logic and preserve pagination metadata.
  - No-result filtered queries return `200` with `{data: [], meta: ...}`.
- Frontend test expectations:
  - Search input updates query and refreshes list content.
  - Genre and schedule controls trigger filtered fetch behavior.
  - Combined criteria produce narrowed results and reset infinite pagination.
  - No-results state renders helpful guidance plus clear-filters action.
  - Clearing filters restores default browse behavior from Story 2.1.
- Regression guardrails:
  - Existing browse flow (no filters) still works for anonymous users.
  - Existing infinite-scroll behavior and loading indicators remain intact.
  - No regression in shared auth/profile modules from unrelated Epic 1 features.

### Previous Story Intelligence

- Story 2.1 already introduced the season library foundation, including:
  - Backend `GET /api/v1/seasons` endpoint and service/schema structure.
  - Frontend season library route and season feature components.
  - React Query-based paginated loading and skeleton/empty-state patterns.
- Build directly on this foundation:
  - Extend the endpoint and API client contract rather than creating parallel endpoints.
  - Keep existing season card data shape stable so Story 2.3 can consume it without refactors.
  - Preserve current loading/no-data UX patterns and tone.
- Lessons to carry forward from Story 2.1 artifacts:
  - Keep RFC 7807 compliance for backend failures.
  - Use shared type locations (`frontend/src/types`) for API contracts.
  - Prefer additive feature evolution over structural rewrites.

### Git Intelligence Summary

- Recent commit stream indicates active work on frontend styling, local dev tooling, and completed Epic 1 auth/profile implementation.
- Current branch/worktree contains in-flight Epic 2 season files; implementation should avoid unrelated churn and focus only on season-search-filter scope.
- Existing conventions in recent commits favor:
  - feature-oriented component organization,
  - typed API layers,
  - test coverage for both backend and frontend behavior.

### Latest Tech Information

- Next.js 15 stable guidance confirms notable caching default changes; be explicit when defining caching/revalidation so filtered season results remain fresh.
- FastAPI guidance is centered on Pydantic v2 patterns; new work should avoid legacy v1 model idioms unless required for compatibility in existing code paths.
- Practical implication for this story:
  - avoid stale cached filter responses,
  - keep schema and serialization aligned with Pydantic v2,
  - maintain predictable query behavior under pagination.

### Project Structure Notes

- Aligns with project structure: season discovery/search remains under season feature modules in both backend and frontend.
- No structural variance required for this story; scope is additive to existing Story 2.1 files and contracts.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.2)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR6, discovery requirements, NFRs)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (stack, structure, API/state conventions)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first interactions, warm tone, empty/loading patterns)]
- [Source: `_bmad-output/implementation-artifacts/2-1-season-library-browse.md` (existing season browse implementation baseline)]
- [Source: [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)]
- [Source: [FastAPI Pydantic v2 Migration Guide](https://fastapi.tiangolo.com/how-to/migrate-from-pydantic-v1-to-pydantic-v2/)]

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- Workflow: `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Instructions: `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml`
- Checklist: `_bmad/bmm/workflows/4-implementation/create-story/checklist.md`
- Workflow: `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`
- Instructions: `_bmad/bmm/workflows/4-implementation/dev-story/instructions.xml`
- Checklist: `_bmad/bmm/workflows/4-implementation/dev-story/checklist.md`

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story selected from first backlog entry in sprint status: `2-2-season-search-filter`.
- Epic and architecture/UX constraints analyzed and translated into implementation guardrails.
- Previous story and recent git pattern intelligence incorporated to prevent regressions.
- Story document finalized with status `ready-for-dev`.
- Implemented backend filter support (`search`, `genre`, `schedule=this-week`) for `GET /api/v1/seasons` with AND semantics.
- Added frontend search and filter controls wired to React Query query keys and API params.
- Added no-results filtered state with clear-filters action while preserving default empty-state messaging.
- Added/updated backend and frontend season tests; targeted suites pass.
- Resolved backend regression blocker by fixing test path config and updating profile/profile-photo test mocks/assertions.
- Full backend regression suite passes: `61 passed`.

### File List

- `_bmad-output/implementation-artifacts/2-2-season-search-filter.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/services/season_service.py`
- `backend/tests/test_seasons.py`
- `backend/pyproject.toml`
- `backend/tests/test_profile.py`
- `backend/tests/test_profile_photo.py`
- `frontend/src/types/season.ts`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/components/features/season/season-library.tsx`
- `frontend/src/components/features/season/season-library.test.tsx`
