# Story 2.4: view-user-profiles

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to view season creator and member profiles,
so that I can learn more about the community before joining.

## Acceptance Criteria

1. **Given** I am on the season detail page **When** I view the creator information **Then** I see the creator's name, profile photo, and bio.
2. **Given** I am on the season detail page **When** I scroll to the members section **Then** I see a list of current members **And** each member shows their name and profile photo.
3. **Given** I am on the season detail page **When** I tap on a member's name or avatar **Then** I see their public profile (name, photo, bio, favorite genres).
4. **Given** I am on the season detail page **When** I tap on the creator's profile **Then** I see their full profile information.

## Tasks / Subtasks

- [x] Add backend public-profile contracts and endpoints for season members (AC: 1, 2, 3, 4)
  - [x] Extend season detail response to include creator and member summary data required by UI (`name`, `profile_photo_url`, ids).
  - [x] Add a public profile read endpoint for viewing another user profile safely (no private fields), reusing RFC 7807 error format.
  - [x] Ensure only public-safe profile fields are returned (`id`, display name, bio, profile photo, favorite genres).
- [x] Build frontend creator + members section in season detail (AC: 1, 2)
  - [x] Render creator card in `season-detail.tsx` above or near join decision context.
  - [x] Render member list with avatar + name and touch targets >=44x44.
- [x] Add public profile detail view flow (AC: 3, 4)
  - [x] Implement route for viewing another member profile.
  - [x] Wire season detail creator/member taps to navigate to profile view.
  - [x] Show warm fallback states when profile fields are missing.
- [x] Add tests and regression checks (AC: 1, 2, 3, 4)
  - [x] Backend tests for success/not-found/error response shape.
  - [x] Frontend tests for creator/member rendering and navigation.
  - [x] Regression tests to preserve Story 2.3 season detail behavior.

### Review Findings

- [x] [Review][Decision] Clarify "full profile information" scope for creator/member drill-down — resolved as public profile parity (Option 1): "full" means full public-safe profile contract (`id`, `display_name`, `bio`, `favorite_genres`, `profile_photo_url`).
- [x] [Review][Patch] Creator bio missing from season detail card [backend/app/schemas/season.py:61]
- [x] [Review][Patch] Public profile view can crash on malformed success payload (`query.data.data` unchecked) [frontend/src/components/features/profile/public-profile.tsx:43]
- [x] [Review][Patch] Favorite genre chip keys can collide for duplicate genre values [frontend/src/components/features/profile/public-profile.tsx:75]

## Dev Notes

### Developer Context Section

- This story extends Story 2.3's season detail screen and is a precondition for confident joining in Story 2.5.
- Do not fork a second profile model; extend existing profile/user contracts in a backward-compatible way.
- Keep mobile-first decision flow: creator context first, members preview second, drill-down profile on tap.

### Technical Requirements

- Backend:
  - Keep endpoint namespace under existing routers:
    - `backend/app/api/v1/endpoints/seasons.py`
    - `backend/app/api/v1/endpoints/users.py`
  - Add season detail fields for creator/member summaries by joining user data in `SeasonService`.
  - Add/read public member profile endpoint for `user_id` path param (UUID validated at boundary).
  - Keep success envelopes and RFC 7807 problem responses consistent with season endpoints.
- Frontend:
  - Extend `frontend/src/types/season.ts` and `frontend/src/lib/api/seasons.ts` for creator/member payloads.
  - Add public profile API client function in `frontend/src/lib/api/profile.ts` (or equivalent existing profile API module).
  - Continue React Query v5 with stable query keys including user id for profile view.
  - Preserve current season detail loading, error, and meetup sections.

### Architecture Compliance

- Follow established structure and do not relocate concerns:
  - Season feature UI stays in `frontend/src/components/features/season/*`.
  - Profile view UI stays in `frontend/src/components/features/profile/*` and route under `frontend/src/app/(main)/...`.
  - Backend read logic in service layer; endpoints remain thin transport layers.
- Keep naming conventions:
  - API paths kebab/plural style.
  - TypeScript component names PascalCase.
  - SQL/query alias fields snake_case mapped into typed schemas.

### Library and Framework Requirements

- Next.js App Router 15 + React 19 patterns.
- TanStack Query v5 for server state:
  - Query keys must include route param identity (e.g., `['public-profile', userId]`).
- FastAPI with Pydantic v2 models (avoid `pydantic.v1` for new additions).
- Keep existing async SQLAlchemy patterns already used in `SeasonService` and `ProfileService`.

### File Structure Requirements

- Expected backend touchpoints:
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/app/services/season_service.py`
  - `backend/app/schemas/season.py`
  - `backend/app/api/v1/endpoints/users.py`
  - `backend/app/services/profile_service.py`
  - `backend/app/schemas/profile.py`
  - `backend/tests/test_seasons.py`
  - `backend/tests/test_users.py`
- Expected frontend touchpoints:
  - `frontend/src/components/features/season/season-detail.tsx`
  - `frontend/src/types/season.ts`
  - `frontend/src/lib/api/seasons.ts`
  - `frontend/src/lib/api/profile.ts`
  - `frontend/src/app/(main)/profile/[userId]/page.tsx` (or existing route-conformant equivalent)
  - `frontend/src/components/features/profile/*` for public profile rendering
  - Matching frontend tests for season/profile behavior

### Files Read (Current State, Change Surface, Preserve Rules)

- `frontend/src/components/features/season/season-detail.tsx`
  - Current state: renders book, description, location, upcoming meetups only.
  - Story change: add creator and member sections with profile navigation.
  - Must preserve: existing loading/error UX and meetup rendering.
- `frontend/src/app/(main)/seasons/[seasonId]/page.tsx`
  - Current state: route shell for season detail.
  - Story change: no structural rewrite; keep it as thin page wrapper.
  - Must preserve: current layout shell and spacing behavior.
- `frontend/src/lib/api/seasons.ts` and `frontend/src/types/season.ts`
  - Current state: includes season browse and detail types + APIs.
  - Story change: extend detail type with creator/member summaries.
  - Must preserve: existing browse/detail function signatures used by Story 2.1-2.3.
- `backend/app/api/v1/endpoints/seasons.py` + `backend/app/services/season_service.py`
  - Current state: public season browse/detail endpoints, deterministic meetup ordering.
  - Story change: enrich detail payload with creator/member public summary data.
  - Must preserve: existing 2.3 response contract fields and error handling semantics.
- `backend/app/api/v1/endpoints/users.py` + `backend/app/services/profile_service.py`
  - Current state: authenticated self-profile endpoints (`/users/me`), profile photo upload/delete flows.
  - Story change: add public-read profile capability without exposing private-only fields.
  - Must preserve: existing auth/self-profile endpoints and upload rate-limit behavior.

### Testing Requirements

- Backend:
  - Season detail includes creator summary and member list with stable field names.
  - Public profile endpoint returns safe fields and not-found RFC 7807 payload.
  - Existing Story 2.3 detail tests remain green.
- Frontend:
  - Season detail renders creator + members list and profile tap targets.
  - Creator/member tap navigates correctly to public profile view.
  - Public profile view shows name/photo/bio/favorite genres with warm fallbacks.
  - Existing season detail tests continue to pass with minimal fixture updates.

### Previous Story Intelligence

- Story 2.3 established key patterns to keep:
  - consistent `{data, meta}` success envelope,
  - RFC 7807 error payloads,
  - typed API client + shared TypeScript contracts,
  - warm fallback copy and skeleton states.
- Reuse these directly to avoid regressions and duplicated patterns.

### Git Intelligence Summary

- Recent Epic 2 commits confirm additive delivery per story (`2-2` then `2-3`) with scoped feature changes.
- Keep this same pattern: small, reversible deltas with test coverage bundled in the same story implementation.

### Latest Tech Information

- Next.js 15 upgrade guidance (updated March 16, 2026) confirms fetch is not cached by default; if any server-side fetch is introduced for profile pages, explicitly choose cache semantics.
- FastAPI migration guidance indicates ongoing deprecation/removal path for Pydantic v1 compatibility, with Python 3.14 incompatibility; use Pydantic v2-only models for new profile DTOs.
- TanStack Query v5 defaults treat cached data as stale and refetch aggressively; define query keys with user identity to avoid cache collisions between member profiles.

### Project Structure Notes

- No architecture reshuffle needed.
- This story is a vertical extension of season detail + profile domains and should remain within those existing module boundaries.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.4)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR8)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (stack, API standards, folder boundaries)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first, warm tone, touch targets)]
- [Source: `_bmad-output/implementation-artifacts/2-3-season-detail-view.md` (carry-forward patterns)]
- [Source: [Next.js Upgrade v15](https://nextjs.org/docs/app/guides/upgrading/version-15)]
- [Source: [Next.js Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)]
- [Source: [FastAPI Pydantic v2 migration](https://fastapi.tiangolo.com/how-to/migrate-from-pydantic-v1-to-pydantic-v2/)]
- [Source: [TanStack Query Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)]

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Workflow skill: `.agents/skills/bmad-create-story/SKILL.md`
- Story template: `.agents/skills/bmad-create-story/template.md`
- Story checklist: `.agents/skills/bmad-create-story/checklist.md`
- Backend targeted tests: `backend/.venv/bin/pytest -q tests/test_seasons.py tests/test_profile.py`
- Backend full regression: `backend/.venv/bin/pytest -q`
- Frontend targeted tests: `npm test -- --runInBand src/components/features/season/season-detail.test.tsx src/components/features/profile/public-profile.test.tsx src/lib/api/profile.test.ts`
- Frontend full regression: `npm test -- --runInBand`
- Frontend lint: `npm run lint`

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story selected from first backlog entry in sprint status: `2-4-view-user-profiles`.
- Epic, architecture, UX, PRD, previous story, recent commits, and implementation touchpoints analyzed.
- Latest framework guidance incorporated for Next.js 15, FastAPI/Pydantic v2, and React Query v5 defaults.
- Added backend public profile endpoint `GET /api/v1/users/{user_id}/profile` with RFC 7807 `404/500` responses.
- Extended season detail contracts and service output to include `creator` and `members` profile summaries.
- Added frontend creator/member sections on season detail with profile navigation links.
- Added public profile route and feature UI with warm fallback states for missing bio/photo/genres.
- Added/updated backend and frontend tests for new contracts, navigation behavior, and API client path encoding.
- Validation complete: backend `71 passed`; frontend `47 passed`; lint passes with pre-existing warnings.
- Story finalized with status `review`.

### File List

- `_bmad-output/implementation-artifacts/2-4-view-user-profiles.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/users.py`
- `backend/app/schemas/profile.py`
- `backend/app/schemas/season.py`
- `backend/app/services/profile_service.py`
- `backend/app/services/season_service.py`
- `backend/tests/test_profile.py`
- `backend/tests/test_seasons.py`
- `frontend/src/app/(main)/profile/[userId]/page.tsx`
- `frontend/src/components/features/profile/public-profile.tsx`
- `frontend/src/components/features/profile/public-profile.test.tsx`
- `frontend/src/components/features/season/season-detail.tsx`
- `frontend/src/components/features/season/season-detail.test.tsx`
- `frontend/src/lib/api/profile.ts`
- `frontend/src/lib/api/profile.test.ts`
- `frontend/src/types/season.ts`

## Change Log

- 2026-05-01: Created Story 2.4 implementation context and advanced status to `ready-for-dev`.
- 2026-05-01: Implemented Story 2.4 creator/member profile discovery flow, added backend/frontend tests, and advanced status to `review`.
