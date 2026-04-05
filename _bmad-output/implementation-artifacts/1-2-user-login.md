# Story 1.2: User Login

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a registered user,
I want to log in with my email and password,
So that I can access my account and personalized features.

## Acceptance Criteria

1. **Given** I am on the login page, **When** I enter my correct email and password, **Then** I am successfully logged in, **And** I am redirected to the home/season discovery page

2. **Given** I am on the login page, **When** I enter an incorrect password, **Then** I see an error message indicating invalid credentials, **And** I remain on the login page

3. **Given** I am on the login page, **When** I enter an email that doesn't exist, **Then** I see an error message indicating invalid credentials, **And** I remain on the login page

4. **Given** I am on the login page, **When** I successfully log in, **Then** a JWT token is issued and stored securely, **And** subsequent requests include authentication

## Tasks / Subtasks

- [x] Task 1: Backend Login Endpoint (AC: #1, #2, #3, #4)
  - [x] Subtask 1.1: Create Pydantic schema for login request/response
  - [x] Subtask 1.2: Implement `/auth/login` POST endpoint
  - [x] Subtask 1.3: Add credential validation (email exists, password matches)
  - [x] Subtask 1.4: Return JWT token on successful login
  - [x] Subtask 1.5: Implement rate limiting on login attempts

- [x] Task 2: Frontend Login Page (AC: #1, #2, #3, #4)
  - [x] Subtask 2.1: Create login page at `frontend/src/app/(auth)/login/page.tsx`
  - [x] Subtask 2.2: Implement email input with validation
  - [x] Subtask 2.3: Implement password input with show/hide toggle
  - [x] Subtask 2.4: Add submit button with loading state
  - [x] Subtask 2.5: Handle success: redirect to home + store token
  - [x] Subtask 2.6: Handle errors: display user-friendly messages
  - [x] Subtask 2.7: Add "Remember me" checkbox (optional, store token longer)

- [x] Task 3: Frontend Auth State Update (AC: #4)
  - [x] Subtask 3.1: Extend Zustand auth store with login action
  - [x] Subtask 3.2: Update useAuth hook with login function
  - [x] Subtask 3.3: Ensure session validation runs on login

- [x] Task 4: Testing (AC: All)
  - [x] Subtask 4.1: Write backend unit tests for login endpoint
  - [x] Subtask 4.2: Write backend tests for credential validation
  - [x] Subtask 4.3: Write frontend component tests for login form
  - [x] Subtask 4.4: Test error message display

## Dev Notes

- Login reuses the authentication infrastructure created in Story 1.1 (User Registration)
- Must handle both "email not found" and "wrong password" with same message to prevent enumeration
- JWT token handling should be consistent with registration flow
- Warm, welcoming UI matching registration page design

### Project Structure Notes

**Backend:**
- Endpoint: `backend/app/api/v1/endpoints/auth.py` (extend existing)
- Service: `backend/app/services/auth_service.py` (add authenticate_user method)
- Schema: `backend/app/schemas/user.py` (add login schemas)

**Frontend:**
- Page: `frontend/src/app/(auth)/login/page.tsx`
- Components: Reuse `frontend/src/components/features/auth/auth-card.tsx`
- Hook: Update `frontend/src/hooks/useAuth.ts`
- Store: Update `frontend/src/stores/auth-store.ts`

### References

- [Architecture: API Design Standards - Source: _bmad-output/planning-artifacts/architecture.md#lines-137-144]
- [Architecture: Naming Patterns - Source: _bmad-output/planning-artifacts/architecture.md#lines-165-199]
- [PRD: FR2 User Login - Source: _bmad-output/planning-artifacts/prd.md]
- [UX: Emotional Design - Source: _bmad-output/planning-artifacts/ux-design-specification.md#lines-105-158]
- [Previous Story: 1-1-user-registration - Source: _bmad-output/implementation-artifacts/1-1-user-registration.md]

## Dev Agent Record

### Agent Model Used

big-pickle (opencode/big-pickle)

### Debug Log References

- Backend login endpoint: `backend/app/api/v1/endpoints/auth.py` (lines 220-337)
- Login rate limiting: Added `check_login_rate_limit()` function
- Auth service authenticate: `backend/app/services/auth_service.py` (lines 153-187)
- Login form component: `frontend/src/components/features/auth/login-form.tsx`
- Auth store login action: `frontend/src/stores/auth-store.ts` (login method)

### Completion Notes List

**Backend Implementation:**
- Added `LoginRequest` and `LoginResponse` Pydantic schemas in `backend/app/schemas/user.py`
- Implemented `authenticate_user()` method in `AuthService` class
- Created `/auth/login` POST endpoint with rate limiting (5 attempts per 5 minutes)
- Security: Same error message for invalid email OR password to prevent enumeration

**Frontend Implementation:**
- Created login page at `frontend/src/app/(auth)/login/page.tsx`
- Created login form component with React Hook Form + Zod validation
- Added password visibility toggle
- Added "Remember me" checkbox (UI only, backend token persistence is 7 days)
- Updated Zustand auth store with `login()` action
- Updated useAuth hook with `login` function

**Testing:**
- Backend: Added 5 new tests for login schemas and auth service
- Frontend: Added 10 tests for login form component
- All 28 backend auth tests pass

### File List

| File | Action | Notes |
|------|--------|-------|
| `backend/app/schemas/user.py` | MODIFY | Add LoginRequest, LoginResponse schemas |
| `backend/app/services/auth_service.py` | MODIFY | Add authenticate_user method |
| `backend/app/api/v1/endpoints/auth.py` | MODIFY | Add /auth/login endpoint with rate limiting |
| `backend/app/core/database.py` | CREATE | Lazy singleton database engine (fixes per-request engine creation) |
| `backend/app/core/security.py` | MODIFY | Document constant-time password verification via passlib |
| `frontend/src/app/(auth)/login/page.tsx` | CREATE | Login page |
| `frontend/src/components/features/auth/login-form.tsx` | CREATE | Login form component |
| `frontend/src/stores/auth-store.ts` | MODIFY | Add login action |
| `frontend/src/hooks/useAuth.ts` | MODIFY | Add login function |
| `backend/tests/test_auth.py` | MODIFY | Added login tests (28 total) |
| `frontend/src/components/features/auth/login-form.test.tsx` | CREATE | Frontend login form tests |

---

## Change Log

| Date | Change | Notes |
|------|--------|-------|
| 2026-04-04 | Initial implementation | Created login endpoint, page, form, and tests |
| 2026-04-04 | Code review fixes | Fixed database engine per-request creation, added thread lock to rate limiter, documented constant-time password verification, added TODO for Remember Me |

---

# Technical Requirements

## Backend Requirements

### Technology Stack (from Architecture)
- **Framework:** FastAPI with async support
- **ORM:** SQLAlchemy 2.0 with asyncpg
- **Auth:** JWT via python-jose, password hashing via passlib[bcrypt]
- **Validation:** Pydantic v2

### API Endpoint
```
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Success Response (200):
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2026-04-03T00:00:00Z"
    },
    "access_token": "jwt-token",
    "token_type": "bearer"
  }
}

Error Response (401):
{
  "error": {
    "type": "invalid_credentials",
    "title": "Unauthorized",
    "status": 401,
    "detail": "Invalid email or password"
  }
}
```

### Error Handling
- Use RFC 7807 Problem Details format
- NEVER reveal whether email exists or password is wrong - same message for both
- Rate limit login attempts (5 per 5 minutes per IP/email)

### Security Requirements
- Password verification using bcrypt (reuse from registration)
- JWT token generation with 7-day expiration (same as registration)
- Rate limiting on login endpoint to prevent brute force

---

## Frontend Requirements

### Technology Stack (from Architecture)
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Components:** shadcn/ui (Button, Input, Card, Toast)
- **Forms:** React Hook Form + Zod
- **State:** Zustand for auth state
- **Styling:** Tailwind CSS with custom warm color palette

### Design System (from UX)
- **Colors:** Use warm palette (primary: `#4e6240`, surface: `#faf9f5`)
- **Inputs:** Pill-shaped, `surface-container-high` background
- **Buttons:** Gradient fill for primary CTA, roundedness-full
- **Typography:** Manrope for UI, Newsreader for headlines

### Login Page Layout
```
┌─────────────────────────────────┐
│                                 │
│     "Welcome back"              │
│     [Headline - Newsreader]     │
│                                 │
│     "Sign in to continue        │
│      your reading journey"      │
│     [Subheadline]               │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Email                   │    │
│  │ user@example.com        │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Password            👁  │    │
│  │ •••••••••              │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ [ ] Remember me         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │      Sign In            │    │
│  └─────────────────────────┘    │
│                                 │
│  "Don't have an account?"       │
│  [Create account]               │
│                                 │
└─────────────────────────────────┘
```

### Auth State Management
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

---

# Architecture Compliance

## MUST Follow
1. **Database naming:** snake_case, plural (`users`, `password_hash`)
2. **API naming:** kebab-case endpoints (`/auth/login`)
3. **API response format:** `{data, meta}` for success, RFC 7807 for errors
4. **Error handling:** Consistent RFC 7807 Problem Details format
5. **JWT token:** Include in Authorization header as `Bearer <token>`

## MUST NOT Do
1. Do NOT use plain text passwords (must hash with bcrypt)
2. Do NOT return password or hash in any response
3. Do NOT reveal if email exists vs password is wrong (security vulnerability)
4. Do NOT use JavaScript `Date` (use proper date handling)

---

# Previous Story Intelligence

## From Story 1.1: User Registration

### Key Learnings

**Backend Implementation Patterns:**
- Use async/await consistently throughout FastAPI backend
- Database engine should be lazily created (not at module import)
- Use dependency injection for database sessions
- All endpoints return JSONResponse for data envelope format

**Frontend Implementation Patterns:**
- Zustand with localStorage persistence for auth state
- useAuth hook for authentication actions
- React Hook Form + Zod for form validation
- Real-time password validation feedback
- Success message before redirect

**Testing Approaches:**
- Backend: Unit tests for password hashing, validation, JWT tokens, AuthService
- Frontend: Component tests for form validation, error display, store state

**Problems Encountered & Solutions:**
1. get_db() placeholder → Implemented proper async database session dependency
2. Hardcoded SECRET_KEY → Made configurable via pydantic-settings
3. Frontend type mismatch → Fixed AuthResponse to match backend data envelope
4. No confirmation message → Added success toast after registration

### Code Review Fixes Applied to Story 1.1

| Issue | Severity | Solution |
|-------|----------|----------|
| Database engine at import | HIGH | Lazy initialization via get_async_session_factory() |
| CORS hardcoded | HIGH | Made configurable via environment |
| No rate limiting | MEDIUM | Added check_rate_limit() function |
| SECRET_KEY placeholder | MEDIUM | Now requires env var with validation |
| Client-side JWT only | MEDIUM | Added /validate-session endpoint + frontend integration |

---

# Latest Technical Information

## FastAPI Best Practices
- Use dependency injection for database sessions
- Implement proper CORS configuration for frontend origin
- Use async/await consistently throughout
- Configure proper logging for debugging
- Rate limiting is critical for auth endpoints

## Security Reminders
- Never log sensitive data (passwords, tokens)
- Use HTTPS in production
- Implement rate limiting to prevent brute force attacks
- Validate all input on server side (don't trust client)
- Use constant-time comparison for passwords to prevent timing attacks

---

# Project Context Reference

**Project:** beansprout
**Type:** Mobile-first PWA for book club facilitation
**Complexity:** Low-Medium (greenfield)
**User:** Loongluangkhot (intermediate skill level)

**Core Value Proposition:** "Facilitation as Inclusion" - structured meetup tools that help shy participants feel included in book club discussions.

**Design Philosophy:** Warm, inviting, non-judgmental. The "Digital Conservatory" aesthetic - botanical gardens + private library feel.

---

# Story Completion Status

**Created:** 2026-04-04
**Status:** done
**Story ID:** 1.2
**Story Key:** 1-2-user-login

**Analysis Complete:** Story context includes all technical requirements, architecture patterns, previous story learnings, and developer guardrails needed for flawless implementation.

**Code Review Passed:** 2026-04-05

---

# Epic 1 Code Review Fixes (2026-04-05)

**Issues Fixed:**
1. **Duplicate imports in auth.py** - Removed duplicate `logging` and `defaultdict` imports
2. **Unused imports in auth.py** - Removed `AsyncIterator`, `asynccontextmanager`, `create_async_engine`, `settings`, `get_async_session_factory`, `Any`
3. **Story status updated** - Changed from "ready-for-dev" to "done"