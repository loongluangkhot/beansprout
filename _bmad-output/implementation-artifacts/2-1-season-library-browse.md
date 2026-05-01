# Story 2.1: season-library-browse

Status: done



## Story

As a user,  
I want to browse public seasons in the library,  
so that I can discover book clubs I might want to join.

## Acceptance Criteria

1. **Given** I am on the home/season library page **When** the page loads **Then** I see a grid/list of public seasons **And** each season card shows the book title, author, theme, and next meetup date.
2. **Given** I am on the season library **When** I scroll through the list **Then** seasons are loaded with smooth pagination/infinite scroll **And** loading indicators appear while fetching.
3. **Given** I am on the season library **When** there are no seasons available **Then** I see a friendly empty state message **And** I'm encouraged to start my own season.

## Tasks / Subtasks

- Build backend endpoint for public season browse (AC: 1, 2, 3)
  - Add `GET /api/v1/seasons` with query params for pagination (`page`, `page_size`) and default sorting by nearest upcoming meetup.
  - Return only published/public seasons and include required card fields: season id, title, theme, next meetup datetime, book title, book author, cover image URL, member count.
  - Follow project response format (`{data, meta}`), include pagination metadata.
- Add frontend season library route and data layer (AC: 1, 2)
  - Implement season library page in `frontend/src/app/(main)/seasons/page.tsx` (or home route if this project maps discovery to main landing route).
  - Create API client method in `frontend/src/lib/api` and TypeScript types in `frontend/src/types`.
  - Use React Query infinite query pattern for incremental loading.
- Implement season card/list UI (AC: 1)
  - Create `SeasonCard` component under `frontend/src/components/features/season/`.
  - Render required fields: book title, author, theme, next meetup date (formatted, local timezone-safe).
  - Ensure card tap target routes to season detail page path used by this project.
- Implement loading and empty states (AC: 2, 3)
  - Use skeleton loaders (not spinner-only) during initial and paginated fetches.
  - Add empty-state copy aligned with warm, inviting tone.
  - Include CTA to create a season if user is authenticated.
- Add tests for browse flow (AC: 1, 2, 3)
  - Backend tests for endpoint filtering, pagination metadata, and empty result.
  - Frontend tests for season card rendering, loading state, and empty state behavior.
  - Verify no regression to existing auth/profile routes and components.

## Dev Notes

### Story Foundation and Business Context

- Epic 2 focuses on season discovery and joining; Story 2.1 is the discovery foundation for Stories 2.2-2.5.
- This story must establish stable browse data contracts that search/filter (2.2) and detail/join flows (2.3-2.5) will build on.
- UX intent is mobile-first discovery with low friction and clear decision info at a glance.

### Technical Requirements

- Frontend stack remains Next.js App Router + React 19 + TypeScript.
- Backend stack remains FastAPI + async SQLAlchemy + PostgreSQL.
- API naming must remain kebab/plural route style and use `/api/v1/`* conventions.
- Dates should be ISO 8601 UTC from backend; frontend handles presentation formatting.
- Do not introduce alternative global state libraries; use existing React Query + Zustand boundaries.

### Architecture Compliance

- Keep feature-based organization:
  - Frontend feature components in `frontend/src/components/features/season/`.
  - Backend seasons endpoint in `backend/app/api/v1/endpoints/seasons.py`.
  - Business logic in `backend/app/services/`.
  - Schemas in `backend/app/schemas/`.
- Co-locate tests with relevant code when possible, following existing project style.
- Preserve RFC 7807 problem details for errors and avoid ad-hoc error payloads.

### Library and Framework Guardrails

- Next.js 15 + React 19 assumptions:
  - Request-related APIs in App Router can be async; avoid legacy sync assumptions.
  - Prefer server-friendly data boundaries but keep interactive infinite scroll in client components where needed.
- FastAPI/Pydantic:
  - Use Pydantic v2 style models and validators.
  - Avoid introducing `pydantic.v1` compatibility patterns in new code.

### File Structure Requirements

- Create new season discovery components under `frontend/src/components/features/season/` instead of reusing auth/profile folders.
- Keep shared primitives in `frontend/src/components/ui/` unchanged unless genuinely reusable updates are required.
- Add API client helpers to existing frontend API layer, not directly in page components.
- If backend requires new DB fields for listing data completeness, add Alembic migration and SQLAlchemy model updates in standard paths.

### Testing Requirements

- Backend:
  - Endpoint returns only public/published seasons.
  - Pagination metadata correctness and stable ordering.
  - Empty dataset returns `data: []` with valid `meta`.
- Frontend:
  - Initial load displays skeleton(s), then list.
  - Infinite pagination appends results correctly.
  - Empty state message appears when no seasons are available.
  - Card content includes title, author, theme, and next meetup date.

### Regression and Reuse Guardrails

- Reuse existing API client patterns and auth token handling from established auth/profile work; do not duplicate fetch/auth wrappers.
- Ensure unauthenticated users can browse seasons (read-only), while join/create CTAs respect current auth flow.
- Avoid adding custom styling systems; continue Tailwind + existing design token approach.

### UX and Accessibility Guardrails

- Maintain warm, non-judgmental copy in empty and error states.
- Ensure touch targets meet minimum 44x44px and keyboard focus states are visible.
- Keep loading transitions smooth and non-jarring (skeleton preferred over spinner-only).
- Preserve mobile-first behavior for list/card layout and scrolling.

### Performance Guardrails

- Keep initial payload small via pagination defaults.
- Use React Query caching to avoid unnecessary refetch loops.
- Support incremental loading without long main-thread blocking.
- Maintain PRD targets (fast perceived load on 4G; responsive interactions).

### Security Guardrails

- Public browse endpoint should expose only public-season fields; do not leak private member data.
- Keep authentication optional for browse endpoint but enforce auth for privileged actions (future stories).
- Continue no-sensitive-data-in-logs policy for request/response logging.

### Previous Story Intelligence

- No previous story exists for Epic 2 (`2-0` does not exist), so use architecture conventions and Epic 1-established coding/testing patterns as baseline.

### Git Intelligence Summary

- Recent commits indicate active frontend styling and auth/profile test work.
- Current repository already contains substantial in-progress changes; avoid touching unrelated files while implementing Story 2.1.
- Follow recent conventions for component/test organization and existing package/tooling choices rather than introducing new frameworks.

### Latest Tech Information (Web Research)

- Next.js 15 remains the stable line; React 19 is the aligned React version for current Next.js 15 guidance.
- Notable Next.js 15 behavior shift: caching defaults changed for fetch/GET handlers; explicitly choose caching behavior for season browse to avoid stale lists.
- FastAPI ecosystem guidance has shifted fully toward Pydantic v2 patterns; new implementation should avoid deprecated v1 model style.

### Project Structure Notes

- This story should establish the canonical `season` feature folder structure used by subsequent Epic 2 stories.
- If the current app uses home route as discovery entry, keep that UX path but still organize implementation in season feature modules.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.1)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR5, performance/security NFRs)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (stack, structure, response patterns, naming conventions)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first, warm tone, skeleton/loading/empty-state expectations)]
- [Source: [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)]
- [Source: [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)]
- [Source: [FastAPI Pydantic v2 Migration](https://fastapi.tiangolo.com/how-to/migrate-from-pydantic-v1-to-pydantic-v2/)]

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Debug Log References

- Workflow: `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- Instructions: `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml`
- Implementation workflow: `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml`

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story selected automatically from first backlog entry in sprint status.
- Story document generated and marked ready-for-dev.
- Implemented `GET /api/v1/seasons` with pagination and `{data, meta}` envelope.
- Added season service and schema layer for public published season library data.
- Added frontend season discovery route, season library list, season cards, and loading/empty states.
- Added React Query provider and infinite query-driven season loading flow.
- Added backend and frontend tests for season browse behavior.
- Validation: targeted backend tests pass (`tests/test_seasons.py`) and frontend test suites pass.
- Validation note: existing unrelated backend profile/profile-photo tests are currently failing in full-suite run and were not introduced by this story's code changes.
- Code review fixes applied: RFC7807 error response shape corrected, season browse types moved to shared types module, and infinite loading indicators added for paginated fetches.
- Story task audit corrected: auth/profile regression verification task remains open until dedicated regression run.

### File List

- `_bmad-output/implementation-artifacts/2-1-season-library-browse.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/schemas/season.py`
- `backend/app/services/season_service.py`
- `backend/app/api/v1/router.py`
- `backend/tests/test_seasons.py`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/types/season.ts`
- `frontend/src/components/providers/query-provider.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/components/features/season/season-card.tsx`
- `frontend/src/components/features/season/season-library.tsx`
- `frontend/src/components/features/season/season-library.test.tsx`
- `frontend/src/app/(main)/seasons/page.tsx`

### Change Log

- 2026-04-28: Implemented Epic 2 Story 2.1 season library browse backend and frontend flow with pagination, loading/empty states, and tests.
- 2026-05-01: Addressed code review findings by implementing infinite load indicators, standardizing RFC7807 backend error payload, moving season browse types to shared frontend types, and updating task/file records.

### Senior Developer Review (AI)

- Reviewer: Loongluangkhot
- Date: 2026-05-01
- Outcome: Changes Requested issues addressed; story moved to done with one explicit non-blocking follow-up task remaining.
- High/Medium issues fixed:
  - Infinite scroll behavior implemented via IntersectionObserver with fallback manual load trigger.
  - Paginated loading indicators implemented with skeleton cards during `fetchNextPage`.
  - Backend failure response now uses RFC7807 Problem Details shape (`application/problem+json`).
  - Season browse TypeScript contracts moved to shared `frontend/src/types/season.ts`.
  - Story/git documentation discrepancy fixed by including sprint status file in File List.

