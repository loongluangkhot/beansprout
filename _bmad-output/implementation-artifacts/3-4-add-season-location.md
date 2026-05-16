# Story 3.4: add-season-location

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a season creator,
I want to add a location URL/link for meetup venues,
so that members know where meetups will take place.

## Acceptance Criteria

1. **Given** I am in the location step of season creation **When** I enter a location name (e.g., "Bean & Leaf Cafe") **Then** the location name is saved.
2. **Given** I am in the location step **When** I paste a URL/link to the venue **Then** the link is saved and displayed on the season detail page.
3. **Given** I am in the location step **When** I indicate the meetup is virtual **Then** the season is marked as virtual with meeting link.
4. **Given** I am in the location step **When** I indicate the meetup is in-person **Then** I can enter a physical location with address.

## Tasks / Subtasks

- [x] Align location domain contract across backend and frontend before UI changes (AC: 1, 2, 3, 4)
  - [x] Confirm model strategy for AC3/AC4: either (A) explicit fields (`location_type`, `location_address`) with migration, or (B) MVP-safe encoding using existing fields with clear constraints.
  - [x] Keep existing API success/error formats unchanged: success `{data, meta}` and RFC 7807 errors.
- [x] Extend backend create request validation for location fields (AC: 1, 2, 3, 4)
  - [x] Update `backend/app/schemas/season.py` to add normalized, trimmed location fields.
  - [x] Use Pydantic validation for URL semantics (`HttpUrl`/equivalent), with optional behavior handled cleanly.
- [x] Persist location data in season creation service and preserve existing flows (AC: 1, 2, 3, 4)
  - [x] Update `backend/app/services/season_service.py` `create_season(...)` signature and persistence mapping.
  - [x] Preserve creator ownership checks, commit/rollback behavior, and create-then-schedule sequencing.
- [x] Pass location fields through API endpoint and keep auth semantics unchanged (AC: 1, 2, 3, 4)
  - [x] Update `backend/app/api/v1/endpoints/seasons.py` create endpoint payload forwarding only.
  - [x] Do not alter existing unauthorized/not-found/error behavior.
- [x] Extend frontend types and API normalization for location payloads (AC: 1, 2, 3, 4)
  - [x] Update `frontend/src/types/season.ts` create request/response types to match backend contract.
  - [x] Update `frontend/src/lib/api/seasons.ts` payload normalization to trim inputs, omit blank optional values, and enforce valid mode+link combinations.
- [x] Add location step inputs to season creation UI without breaking current happy path (AC: 1, 2, 3, 4)
  - [x] Update `frontend/src/components/features/season/season-create-form.tsx` with location name, location URL, and virtual/in-person controls plus in-person address field.
  - [x] Preserve existing auth redirect behavior, success routing, and create-then-schedule submit sequence.
  - [x] Keep warm, friendly validation messaging and touch-friendly controls.
- [x] Verify season detail location rendering still works with new inputs (AC: 2, 3, 4)
  - [x] Confirm `frontend/src/components/features/season/season-detail.tsx` display logic supports virtual/in-person representation chosen by contract.
  - [x] Preserve fallback copy when location is missing.
- [x] Add tests and regression coverage (AC: 1, 2, 3, 4)
  - [x] Backend: `backend/tests/test_seasons.py` for create validation, persistence, and response shape.
  - [x] Frontend API: `frontend/src/lib/api/seasons.test.ts` for serialization/normalization and invalid input rejection.
  - [x] Frontend form: `frontend/src/components/features/season/season-create-form.test.tsx` for conditional fields and UX validation behavior.
  - [x] Frontend detail: `frontend/src/components/features/season/season-detail.test.tsx` for location presentation and link behavior.
- [x] Regression checks: Story 3.1/3.2/3.3 create+scheduling+settings, plus Story 2.3 season detail read path.

### Review Findings

- [x] [Review][Patch] In-person creates should remain optional/backward-compatible — Removed the requirement for `location_name` or `location_address` on in-person creates after product decision (`backend/app/schemas/season.py`, `frontend/src/lib/api/seasons.ts`).
- [x] [Review][Patch] Persist in-person address separately instead of concatenating into `location_name` — Added explicit `location_address` storage/response contract after product decision (`backend/app/models/season.py`, `backend/alembic/versions/005_add_location_mode_address_to_seasons.py`, `backend/app/services/season_service.py`).
- [x] [Review][Patch] Persist and return explicit virtual/in-person mode — Added `location_mode` storage and response fields after product decision (`backend/app/models/season.py`, `backend/app/schemas/season.py`, `frontend/src/types/season.ts`).
- [x] [Review][Patch] Virtual-mode URL invariant is enforced only in request schema, not service layer [backend/app/services/season_service.py:423]
- [x] [Review][Patch] Frontend form URL validation allows schemes backend rejects and does not validate optional in-person links [frontend/src/components/features/season/season-create-form.tsx:64]
- [x] [Review][Patch] Frontend API helper sends malformed/non-HTTP `location_url` values through to the backend [frontend/src/lib/api/seasons.ts:140]
- [x] [Review][Patch] Invalid `location_mode` is silently coerced to `in-person` instead of failing fast [frontend/src/lib/api/seasons.ts:132]
- [x] [Review][Patch] Frontend lacks max-length checks for `location_name`/`location_address`, causing avoidable backend-only failures [frontend/src/components/features/season/season-create-form.tsx:40]
- [x] [Review][Patch] Frontend create response type is missing returned `location_name`/`location_url` fields [frontend/src/types/season.ts:101]

## Dev Notes

### Developer Context Section

- Story 3.4 extends the same season-creation vertical slice used in Stories 3.1-3.3; do not fork architecture or create parallel flows.
- Existing schema/model already stores `location_name` and `location_url` on season detail; reuse this path instead of creating duplicate storage.
- Main risk is AC3/AC4 domain ambiguity (virtual/in-person + address) versus current DB fields; resolve this early and keep frontend/backend contracts identical.

### Technical Requirements

- Location name must be optional-but-validated text (trimmed, no whitespace-only value if provided).
- Location URL must be validated as a proper URL when provided; invalid URL must fail with consistent validation semantics.
- Virtual/in-person mode must be represented explicitly in payload behavior and UI rules.
- In-person selection must allow address capture (field contract depends on selected modeling approach).
- Preserve existing story guarantees: JWT auth behavior, season ownership checks, and create->schedule workflow ordering.

### Architecture Compliance

- Follow existing architecture standards in `_bmad-output/planning-artifacts/architecture.md`:
  - API responses remain `{data, meta}`.
  - Errors remain RFC 7807 Problem Details.
  - Validation remains Pydantic v2-first.
  - Dates remain ISO 8601 UTC for schedule fields.
- Keep code inside established module boundaries; do not introduce alternate season creation endpoints/routes.

### Library and Framework Requirements

- Frontend: Next.js 15 + React 19 + TypeScript, React Hook Form + Zod, TanStack Query.
- Backend: FastAPI + Pydantic v2 + SQLAlchemy async.
- Current docs guidance:
  - FastAPI/Pydantic: use `HttpUrl` for URL request validation where applicable.
  - Next.js App Router: keep client component form interactions and `useRouter` navigation patterns consistent.

### File Structure Requirements

- Primary update targets (existing files):
  - `backend/app/schemas/season.py`
  - `backend/app/services/season_service.py`
  - `backend/app/api/v1/endpoints/seasons.py`
  - `backend/tests/test_seasons.py`
  - `frontend/src/types/season.ts`
  - `frontend/src/lib/api/seasons.ts`
  - `frontend/src/lib/api/seasons.test.ts`
  - `frontend/src/components/features/season/season-create-form.tsx`
  - `frontend/src/components/features/season/season-create-form.test.tsx`
  - `frontend/src/components/features/season/season-detail.tsx`
  - `frontend/src/components/features/season/season-detail.test.tsx`
- Possible new file only if explicit location-mode schema is adopted:
  - `backend/alembic/versions/<new_migration>.py`

### Read-First Current-State Notes (Critical)

- `backend/app/schemas/season.py`
  - Current state: `SeasonCreateRequest` supports settings fields but no location create fields.
  - Story change: add location validation contract for create payload.
  - Preserve: existing required text validation and membership mode behavior.
- `backend/app/services/season_service.py`
  - Current state: `create_season(...)` persists title/book/description/theme/max_members/membership_mode, not location fields.
  - Story change: persist location data from create request.
  - Preserve: creator existence checks, transaction semantics, `update_schedule` logic.
- `backend/app/api/v1/endpoints/seasons.py`
  - Current state: create endpoint forwards current payload fields and returns typed response.
  - Story change: forward location fields, maintain existing auth and error behavior.
  - Preserve: response models and RFC7807 response shape.
- `frontend/src/types/season.ts` + `frontend/src/lib/api/seasons.ts`
  - Current state: create request type/normalizer lacks location create fields.
  - Story change: include validated location fields and mode-specific constraints.
  - Preserve: required field guards, trim-and-omit normalization, endpoint paths.
- `frontend/src/components/features/season/season-create-form.tsx`
  - Current state: single-page progressive form includes book/settings/schedule and submits create then schedule update.
  - Story change: introduce location controls and conditional validation behavior.
  - Preserve: auth redirect, success routing, and deterministic submit sequence.
- `frontend/src/components/features/season/season-detail.tsx`
  - Current state: already renders `location_name` and optional `location_url`.
  - Story change: ensure display remains accurate with virtual/in-person modeling.
  - Preserve: current friendly fallback copy and link behavior.

### Testing Requirements

- Backend
  - Create payload accepts valid location inputs and rejects invalid URL/mode combinations.
  - Persisted season includes location fields as expected.
  - Endpoint preserves response and error envelopes.
- Frontend API
  - Normalization trims location strings and omits blank optional values.
  - Invalid combinations are prevented before request (where already handled client-side).
- Frontend form
  - Virtual/in-person toggle drives required/optional field behavior correctly.
  - Friendly, actionable validation messages appear for bad inputs.
  - Existing create+schedule flow still executes in order.
- Frontend detail
  - Location name/link render correctly for virtual and in-person cases.
  - Missing location continues to show fallback message.
- Regression
  - Story 2.3 detail flow, Story 3.1 create, Story 3.2 schedule, Story 3.3 settings remain green.

### Previous Story Intelligence

- Story 3.3 established create contract extension workflow across schema -> service -> endpoint -> frontend types/API/form -> tests; repeat this exact pattern.
- Story 3.3 surfaced API contract drift and auth subject pitfalls; avoid introducing inconsistent field naming or bypassing response models.
- Story 3.2/3.3 depend on stable create-then-schedule behavior; do not reorder submit logic while adding location fields.

### Git Intelligence Summary

- Most recent feature commit (`feat: :sparkles: Complete epic-3-3`) modified the exact season-domain files this story needs; continue in-place updates rather than introducing new parallel modules.
- Recent bug-fix commits focused on auth redirect and ORM integrity, reinforcing need for strict regression coverage around auth and persistence.

### Latest Tech Information

- FastAPI/Pydantic current docs support URL validation via `HttpUrl` in request models, which matches this story's location-link requirement.
- Next.js App Router docs confirm current client-form + `useRouter` navigation pattern is valid; no architectural change needed for this story.

### Project Structure Notes

- Stay within existing `frontend/src/components/features/season` and `backend/app/{schemas,services,api}` boundaries.
- Prefer extending existing fields and validators over introducing a new season-location subsystem.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` (Epic 3, Story 3.4)]
- [Source: `_bmad-output/planning-artifacts/prd.md` (FR7, FR12, NFR Security/Performance)]
- [Source: `_bmad-output/planning-artifacts/architecture.md` (API Design Standards, Format Patterns, Structure)]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` (Journey 2 Step 3 Location, Form Validation, Accessibility)]
- [Source: `_bmad-output/implementation-artifacts/3-3-configure-season-settings.md`]
- [Source: `backend/app/schemas/season.py`]
- [Source: `backend/app/services/season_service.py`]
- [Source: `backend/app/api/v1/endpoints/seasons.py`]
- [Source: `frontend/src/types/season.ts`]
- [Source: `frontend/src/lib/api/seasons.ts`]
- [Source: `frontend/src/components/features/season/season-create-form.tsx`]
- [Source: `frontend/src/components/features/season/season-detail.tsx`]

## Dev Agent Record

### Agent Model Used

openai/gpt-5.3-codex

### Debug Log References

- Resolved workflow config with `resolve_customization.py` for `bmad-create-story`.
- Loaded sprint status from `_bmad-output/implementation-artifacts/sprint-status.yaml` and selected first backlog story `3-4-add-season-location`.
- Implemented location-mode propagation in season create endpoint + service persistence mapping.
- Confirmed existing `backend/app/schemas/season.py` location validation contract remained aligned with AC1-AC4.
- Added frontend location fields to create form schema and API normalizer, including virtual/in-person validation rules.
- Added/updated backend and frontend tests, then ran targeted Jest and pytest suites.

### Completion Notes List

- Implemented location capture across backend and frontend create flow with virtual/in-person behavior.
- Persisted location data with explicit `location_mode` and separate `location_address`; virtual seasons default `location_name` to `Virtual meetup` when no name is provided.
- Preserved existing auth semantics, response envelope shape, and create-then-schedule sequence.
- Verified with targeted and full regression runs: `uv run pytest tests/test_seasons.py`, `uv run pytest` (93 passed), and `npm test -- --runInBand` (66 passed).
- Code review patches applied: in-person location is optional, `location_mode`/`location_address` are persisted explicitly, URL validation is aligned across layers, frontend response/detail types are updated, and regression suites remain green.

### File List

- `_bmad-output/implementation-artifacts/3-4-add-season-location.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `backend/app/api/v1/endpoints/seasons.py`
- `backend/app/models/season.py`
- `backend/app/schemas/season.py`
- `backend/app/services/season_service.py`
- `backend/alembic/versions/005_add_location_mode_address_to_seasons.py`
- `backend/tests/test_seasons.py`
- `frontend/src/types/season.ts`
- `frontend/src/lib/api/seasons.ts`
- `frontend/src/lib/api/seasons.test.ts`
- `frontend/src/components/features/season/season-create-form.tsx`
- `frontend/src/components/features/season/season-create-form.test.tsx`
- `frontend/src/components/features/season/season-detail.tsx`
- `frontend/src/components/features/season/season-detail.test.tsx`

## Change Log

- 2026-05-03: Created Story 3.4 implementation context and advanced status to `ready-for-dev`.
- 2026-05-04: Implemented Story 3.4 location fields across create flow, added validation + tests, and advanced status to `review`.
- 2026-05-16: Applied code review fixes for explicit location mode/address persistence and marked story `done`.
