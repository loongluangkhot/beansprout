# Story 2.5: join-a-season

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to join a season,
so that I can participate in meetups and become part of the community.

## Acceptance Criteria

1. **Given** I am on the season detail page **When** I am NOT logged in and tap "Join Season" **Then** I am prompted to log in or create an account **And** after authentication, I return to the season.
2. **Given** I am on the season detail page **When** I am logged in and tap "Join Season" **Then** I am added to the season as a member **And** I see a success confirmation message **And** I can now RSVP to upcoming meetups.
3. **Given** I am on the season detail page **When** I am already a member of that season **Then** I see "Joined" instead of "Join Season" **And** the button is disabled.
4. **Given** I am on the season detail page **When** the season is at maximum capacity **Then** I see "Season Full" instead of "Join Season" **And** the button is disabled.
5. **Given** I am a member of a season **When** I navigate to the season detail page **Then** I see options to RSVP to upcoming meetups.

## Tasks / Subtasks

- [x] Add backend join-season contract and membership endpoint (AC: 1, 2, 4)
  - [x] Add authenticated endpoint under seasons router to join a season.
  - [x] Enforce public + published checks and return RFC 7807 errors for not found / forbidden / conflict.
  - [x] Enforce capacity check atomically so concurrent joins cannot exceed max members.
  - [x] Make join idempotent for existing members (safe repeated taps).
- [x] Extend season detail payload with viewer join state and capacity metadata (AC: 2, 3, 4, 5)
  - [x] Include flags for current viewer: `is_member`, `can_join`, and capacity state derived from `member_count` vs limit.
  - [x] Keep backward compatibility for non-authenticated public detail requests.
- [x] Implement frontend join CTA behavior on season detail (AC: 1, 2, 3, 4)
  - [x] Render `Join Season`, `Joined`, or `Season Full` state based on payload.
  - [x] For unauthenticated users, redirect to auth flow with return URL back to `/seasons/[seasonId]`.
  - [x] For authenticated users, call join mutation, show warm success toast, and refresh detail query.
- [x] Gate RSVP affordances for members only on season detail (AC: 2, 5)
  - [x] Show RSVP actions only when user is member.
  - [x] Keep existing meetup list visible, but preserve "member-only action" boundary.
- [x] Add tests and regression coverage (AC: 1-5)
  - [x] Backend tests for join success, already-member idempotency, full season, and race-safe capacity behavior.
  - [x] Frontend tests for CTA state transitions and auth redirect return behavior.
  - [x] Regression tests ensuring Story 2.3 + 2.4 season detail fields still render as before.

## Dev Notes

### Developer Context Section

- This story is the completion of Epic 2 discovery funnel: browse -> filter -> detail -> social proof -> join.
- Prior story 2.4 already added creator/member social context in season detail; this story adds the conversion action.
- Do not create a second membership model/path. Reuse existing `season_members` table and season detail contracts.

### Technical Requirements

- Backend:
  - Reuse existing seasons endpoint module and service layer (`backend/app/api/v1/endpoints/seasons.py`, `backend/app/services/season_service.py`).
  - Add authenticated join endpoint under `/api/v1/seasons/{season_id}/join`.
  - Use current authentication dependency pattern used by user/profile endpoints.
  - Return API success envelopes (`{data, meta}`) and RFC 7807 for error responses.
- Join behavior rules:
  - Not logged in: API route must require auth (frontend handles redirect before mutation).
  - Already member: return deterministic success (idempotent) and do not duplicate membership row.
  - Capacity reached: return `409 Conflict` Problem Details with clear message.
  - Season not joinable (not public/published/not found): return `404` for public safety.
- Data expectations for detail page:
  - Add minimal membership state fields needed for CTA decisions.
  - Preserve existing story 2.3/2.4 fields (`creator`, `members`, `meetups`, `location`, etc.).

### Architecture Compliance

- Keep thin transport in endpoints and business logic in `SeasonService`.
- Keep SQL naming conventions and API path conventions (plural resource + clear action suffix for join).
- Keep mobile-first UX and warm copy style from UX specification.
- Preserve current season detail route/component boundaries; do not move feature ownership outside season modules.

### Library and Framework Requirements

- Frontend stack remains Next.js App Router + React 19 + TypeScript.
- Continue TanStack Query v5 mutation/query key patterns; invalidate/refetch `['season-detail', seasonId]` after join.
- Backend remains FastAPI + Pydantic v2 style schemas.
- If adding new FastAPI/Pydantic model types, avoid `pydantic.v1` imports.

### File Structure Requirements

- Expected backend touchpoints:
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/app/services/season_service.py`
  - `backend/app/schemas/season.py`
  - `backend/tests/test_seasons.py`
- Expected frontend touchpoints:
  - `frontend/src/components/features/season/season-detail.tsx`
  - `frontend/src/lib/api/seasons.ts`
  - `frontend/src/types/season.ts`
  - `frontend/src/components/features/season/season-detail.test.tsx`
  - Optional auth helper/route utilities already used in existing auth flow

### Files Read (Current State, Change Surface, Preserve Rules)

- `frontend/src/components/features/season/season-detail.tsx`
  - Current state: displays season info, creator/members, location, upcoming meetups; no join CTA.
  - Story change: add join CTA and membership-aware RSVP affordances.
  - Preserve: loading/error cards, creator/member/profile links, meetup rendering.
- `frontend/src/lib/api/seasons.ts` and `frontend/src/types/season.ts`
  - Current state: read-only season browse/detail API clients and types.
  - Story change: add typed join mutation client + detail metadata for membership/capacity state.
  - Preserve: existing method signatures for browse/detail calls used by prior stories.
- `backend/app/api/v1/endpoints/seasons.py`
  - Current state: `GET /seasons` and `GET /seasons/{season_id}`.
  - Story change: add authenticated join endpoint with explicit error handling.
  - Preserve: RFC 7807 formatting and existing read endpoint behavior.
- `backend/app/services/season_service.py`
  - Current state: raw SQL for browse/detail with public + published gating.
  - Story change: add join logic and extend detail state for viewer join/capacity decisions.
  - Preserve: ordering, filtering, and existing detail response compatibility.
- `backend/app/schemas/season.py`
  - Current state: browse/detail response schemas and profile summary fields.
  - Story change: add minimal join response schema and/or detail state fields.
  - Preserve: existing serialized keys so Story 2.3/2.4 UIs remain stable.

### Testing Requirements

- Backend tests:
  - Join success inserts membership and returns expected envelope.
  - Repeated join request by same user is idempotent.
  - Full season returns conflict and does not create extra membership.
  - Not found/non-public/non-published remains non-joinable.
- Frontend tests:
  - Unauthenticated user hitting join path is redirected to auth and return path preserved.
  - Authenticated user sees success state and `Joined` disabled button after mutation.
  - Full season state renders `Season Full` disabled button.
  - Existing creator/member/meetup rendering remains unchanged.

### Previous Story Intelligence

- Story 2.4 established:
  - strict typed API contracts,
  - RFC 7807 consistency,
  - warm fallback copy,
  - feature-local file ownership.
- Reuse these patterns directly; do not introduce alternate response envelopes or ad hoc error shapes.

### Git Intelligence Summary

- Recent commits (`epic-2-2`, `epic-2-3`, `epic-2-4`) show incremental, vertical slices touching both backend and frontend with aligned tests.
- Follow same execution style: scoped changes in season modules, then test updates in the same story.

### Latest Tech Information

- Next.js docs (updated March 31, 2026) indicate the built-in upgrade command is available for versions >= 16.1.0; this project is on Next 15 architecture assumptions, so avoid introducing Next 16-only APIs in this story.
- FastAPI latest release stream shows `0.136.1` as latest (April 23, 2026) and continued Pydantic v2 deprecation cleanup; keep new schema code fully Pydantic v2-compatible.
- TanStack Query important defaults still include stale-by-default, auto-refetch on mount/focus/reconnect, and 3 retries; post-join UI should explicitly invalidate/refetch to avoid stale join button state.

### Project Structure Notes

- No architecture reshuffle required.
- This story is a conversion-focused extension to the existing season detail feature, and should stay within current season feature boundaries.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 2, Story 2.5)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR16)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (API standards, stack, folder boundaries)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (mobile-first, warm tone, 3-tap interaction principles)]
- [Source: `_bmad-output/implementation-artifacts/2-4-view-user-profiles.md` (carry-forward conventions)]
- [Source: [Next.js Upgrading Guide](https://nextjs.org/docs/app/getting-started/upgrading)]
- [Source: [FastAPI Releases](https://github.com/fastapi/fastapi/releases)]
- [Source: [FastAPI Pydantic v2 Migration](https://fastapi.tiangolo.com/how-to/migrate-from-pydantic-v1-to-pydantic-v2/)]
- [Source: [TanStack Query Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)]

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- Workflow skill: `.agents/skills/bmad-create-story/SKILL.md`
- Story template: `.agents/skills/bmad-create-story/template.md`
- Story checklist: `.agents/skills/bmad-create-story/checklist.md`
- Backend targeted tests: `uv run pytest -q tests/test_seasons.py`
- Backend full tests: `uv run pytest -q`
- Frontend targeted tests: `npm test -- --runInBand src/components/features/season/season-detail.test.tsx`
- Frontend full tests: `npm test -- --runInBand`
- Frontend lint: `npm run lint`

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Story selected from first backlog entry in sprint status: `2-5-join-a-season`.
- Epic, architecture, UX, PRD, previous story, recent commits, and implementation touchpoints analyzed.
- Latest framework guidance incorporated for Next.js, FastAPI/Pydantic v2, and TanStack Query defaults.
- Implemented backend `POST /api/v1/seasons/{season_id}/join` with auth check, idempotent membership join, and full-capacity conflict handling.
- Extended season detail payload with `is_member`, `can_join`, and `is_full` for viewer-aware join/RSVP UI decisions.
- Implemented season detail join CTA states (`Join Season`, `Joined`, `Season Full`) and authenticated join mutation refresh flow.
- Added unauthenticated redirect to `/login?redirect=/seasons/[seasonId]` and login flow support to return users to intended season page.
- Added member-only RSVP action visibility on upcoming meetup rows.
- Verified no regressions: backend `76 passed`, frontend `51 passed`, lint passes (pre-existing warnings only).
- Story status updated to `review`.

### File List

- `_bmad-output/implementation-artifacts/2-5-join-a-season.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/schemas/season.py`
- `backend/app/services/season_service.py`
- `backend/tests/test_seasons.py`
- `frontend/src/components/features/auth/login-form.tsx`
- `frontend/src/components/features/season/season-detail.test.tsx`
- `frontend/src/components/features/season/season-detail.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/lib/api/seasons.test.ts`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/types/season.ts`

## Change Log

- 2026-05-01: Created Story 2.5 implementation context and advanced status to `ready-for-dev`.
- 2026-05-01: Implemented Story 2.5 join flow, validated tests/lint, and advanced status to `review`.
