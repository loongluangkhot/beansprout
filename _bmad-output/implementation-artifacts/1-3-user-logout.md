# Story 1.3: User Logout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a logged-in user,
I want to log out of my account,
So that my session is terminated for security.

## Acceptance Criteria

1. **Given** I am logged in, **When** I click the logout button, **Then** my session is terminated, **And** I am redirected to the login page, **And** my JWT token is invalidated

2. **Given** I am logged in, **When** I log out, **Then** I cannot access authenticated routes, **And** I must log in again to access my account

## Tasks / Subtasks

- [x] Task 1: Backend Logout Endpoint (AC: #1, #2)
  - [x] Subtask 1.1: Create POST `/auth/logout` endpoint
  - [x] Subtask 1.2: Implement token invalidation (blocklist or session tracking)
  - [x] Subtask 1.3: Return success response

- [x] Task 2: Frontend Logout Flow (AC: #1)
  - [x] Subtask 2.1: Add logout button in header/navigation
  - [x] Subtask 2.2: Create logout handler in useAuth hook
  - [x] Subtask 2.3: Clear auth state (token, user) from localStorage
  - [x] Subtask 2.4: Redirect to login page after logout
  - [x] Subtask 2.5: Call backend logout endpoint

- [x] Task 3: Frontend Auth State Update (AC: #1, #2)
  - [x] Subtask 3.1: Ensure logout clears all auth state in Zustand store
  - [x] Subtask 3.2: Ensure middleware rejects invalid tokens → DONE via new frontend/middleware.ts

- [x] Task 4: Testing (AC: All)
  - [x] Subtask 4.1: Write backend unit tests for logout endpoint
  - [x] Subtask 4.2: Write frontend tests for logout flow

## Dev Notes

- Logout reuses authentication infrastructure from Stories 1.1 and 1.2
- Must ensure JWT token is properly invalidated server-side for security
- Frontend should clear ALL auth state (user, token, preferences)
- Redirect to login page after successful logout
- Warm, friendly UI - thank user for visiting before redirecting

### Project Structure Notes

**Backend:**
- Endpoint: `backend/app/api/v1/endpoints/auth.py` (extend existing)
- Service: `backend/app/services/auth_service.py` (add logout method)
- Token blocklist: `backend/app/core/security.py` (add token blocklist)

**Frontend:**
- Components: Header/nav component with logout button
- Hook: Update `frontend/src/hooks/useAuth.ts`
- Store: Update `frontend/src/stores/auth-store.ts`
- Middleware: Update `frontend/src/middleware.ts` for auth validation

### References

- [Architecture: API Design Standards - Source: _bmad-output/planning-artifacts/architecture.md#lines-137-144]
- [Architecture: Naming Patterns - Source: _bmad-output/planning-artifacts/architecture.md#lines-165-199]
- [PRD: FR3 User Logout - Source: _bmad-output/planning-artifacts/prd.md]
- [UX: Emotional Design - Source: _bmad-output/planning-artifacts/ux-design-specification.md#lines-105-158]
- [Previous Story: 1-2-user-login - Source: _bmad-output/implementation-artifacts/1-2-user-login.md]
- [Previous Story: 1-1-user-registration - Source: _bmad-output/implementation-artifacts/1-1-user-registration.md]

---

## Technical Requirements

## Backend Requirements

### Technology Stack (from Architecture)
- **Framework:** FastAPI with async support
- **ORM:** SQLAlchemy 2.0 with asyncpg
- **Auth:** JWT via python-jose, password hashing via passlib[bcrypt]
- **Validation:** Pydantic v2

### API Endpoint
```
POST /api/v1/auth/logout
Authorization: Bearer <jwt-token>

Success Response (200):
{
  "data": {
    "message": "Successfully logged out"
  }
}

Error Response (401):
{
  "error": {
    "type": "invalid_token",
    "title": "Unauthorized",
    "status": 401,
    "detail": "Invalid or expired token"
  }
}
```

### Token Invalidation Strategy
**RECOMMENDED:** Token blocklist approach (for simplicity and effectiveness):
- Maintain a Redis or in-memory set of invalidated tokens
- On logout, add token to blocklist with remaining TTL
- On each authenticated request, check token not in blocklist

**ALTERNATIVE:** Session tracking (more complex):
- Store session ID in database with user association
- On logout, mark session as invalid
- Include session_id in JWT claims

### Security Requirements
- JWT token must be invalidated server-side
- Return 401 if token is already invalidated
- Log logout events for audit trail
- Clear any refresh tokens if used

---

## Frontend Requirements

### Technology Stack (from Architecture)
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Components:** shadcn/ui (Button, DropdownMenu)
- **State:** Zustand for auth state
- **Styling:** Tailwind CSS with custom warm color palette

### Design System (from UX)
- **Colors:** Use warm palette (primary: `#4e6240`, surface: `#faf9f5`)
- **Buttons:** Rounded, warm colors for CTA
- **Typography:** Manrope for UI, Newsreader for headlines

### Logout UI Pattern
```
Header/Navigation:
┌─────────────────────────────────┐
│ [Logo]        [Seasons] [Profile]│
│                    [▼ User]    │
│                          [Logout]│
└─────────────────────────────────┘

Dropdown when clicking user name:
┌─────────────────────────┐
│ 👤 John Doe             │
│ john@example.com        │
├─────────────────────────┤
│ 🏠 My Profile           │
│ ⚙️ Settings             │
│ 🚪 Logout               │
└─────────────────────────┘
```

### Auth State Management
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;  // NEW: Clear state and redirect
}
```

### Logout Flow
1. User clicks logout button
2. Call backend `/auth/logout` endpoint
3. Clear auth state from Zustand store
4. Clear auth data from localStorage
5. Redirect to login page
6. Show friendly message: "Thanks for visiting! Come back soon."

---

# Architecture Compliance

## MUST Follow
1. **Database naming:** snake_case, plural
2. **API naming:** kebab-case endpoints (`/auth/logout`)
3. **API response format:** `{data, meta}` for success, RFC 7807 for errors
4. **Error handling:** Consistent RFC 7807 Problem Details format
5. **JWT token:** Include in Authorization header as `Bearer <token>`

## MUST NOT Do
1. Do NOT just remove token client-side (must invalidate server-side)
2. Do NOT allow logged-out users to access protected routes
3. Do NOT leak user data after logout

---

# Previous Story Intelligence

## From Story 1.2: User Login

### Key Learnings

**Backend Implementation Patterns:**
- Use async/await consistently throughout FastAPI backend
- Database engine should be lazily created (not at module import)
- Use dependency injection for database sessions
- All endpoints return JSONResponse for data envelope format
- Rate limiting is critical for auth endpoints

**Frontend Implementation Patterns:**
- Zustand with localStorage persistence for auth state
- useAuth hook for authentication actions
- React Hook Form + Zod for form validation
- Real-time validation feedback

**Security Patterns:**
- Same error message for invalid email OR password to prevent enumeration
- JWT token with 7-day expiration
- Rate limiting on login (5 attempts per 5 minutes)

### Code Review Fixes Applied to Story 1.2
- Database engine at import → Lazy initialization via get_async_session_factory()
- CORS hardcoded → Made configurable via environment
- No rate limiting → Added check_rate_limit() function

## From Story 1.1: User Registration

### Key Learnings

**Backend Implementation Patterns:**
- Use async/await consistently throughout FastAPI backend
- Database engine should be lazily created
- Use dependency injection for database sessions

**Testing Approaches:**
- Backend: Unit tests for password hashing, validation, JWT tokens, AuthService
- Frontend: Component tests for form validation, error display, store state

**Problems Encountered & Solutions:**
1. get_db() placeholder → Implemented proper async database session dependency
2. Hardcoded SECRET_KEY → Made configurable via pydantic-settings

---

# Latest Technical Information

## FastAPI Best Practices
- Use dependency injection for database sessions
- Implement proper CORS configuration for frontend origin
- Use async/await consistently throughout
- Configure proper logging for debugging
- Token blocklist is simplest approach for logout

## Security Reminders
- Never log sensitive data (passwords, tokens)
- Use HTTPS in production
- Implement token invalidation for logout
- Validate all input on server side (don't trust client)
- Use constant-time comparison where applicable

---

# Project Context Reference

**Project:** beansprout
**Type:** Mobile-first PWA for book club facilitation
**Complexity:** Low-Medium (greenfield)
**User:** Loongluangkhot (intermediate skill level)

**Core Value Proposition:** "Facilitation as Inclusion" - structured meetup tools that help shy participants feel included in book club discussions.

**Design Philosophy:** Warm, inviting, non-judgmental. The "Digital Conservatory" aesthetic - botanical gardens + private library feel.

---

## File List

### Backend Files Modified
- `backend/app/core/security.py` - Added token blocklist functionality (add_to_blocklist, is_token_blocked)
- `backend/app/services/auth_service.py` - Added logout method to AuthService
- `backend/app/api/v1/endpoints/auth.py` - Added POST /auth/logout endpoint, audit logging
- `backend/app/schemas/user.py` - Added LogoutResponse schema

### Frontend Files Created
- `frontend/src/components/features/header.tsx` - New Header component with user menu and logout button
- `frontend/src/middleware.ts` - New middleware for route protection

### Frontend Files Modified
- `frontend/src/lib/api/auth.ts` - Added logout API function
- `frontend/src/stores/auth-store.ts` - Added performLogout action
- `frontend/src/hooks/useAuth.ts` - Updated to redirect with logged_out param
- `frontend/src/app/layout.tsx` - Added Header component
- `frontend/src/components/features/auth/login-form.tsx` - Added "Thanks for visiting" message

### Test Files Created/Modified
- `backend/tests/test_auth.py` - Added TokenBlocklist tests
- `frontend/src/stores/auth-store.test.ts` - New test file for auth store

---

## Change Log

- **2026-04-04**: Implemented logout functionality with JWT token blocklist
- **2026-04-04**: Created backend POST /auth/logout endpoint
- **2026-04-04**: Added token invalidation via in-memory blocklist
- **2026-04-04**: Created Header component with user dropdown menu
- **2026-04-04**: Updated auth store with performLogout action
- **2026-04-04**: Added backend unit tests for token blocklist
- **2026-04-04**: Story implementation complete
- **2026-04-04 (Code Review Fix)**: Added frontend middleware for route protection
- **2026-04-04 (Code Review Fix)**: Added audit logging to logout endpoint
- **2026-04-04 (Code Review Fix)**: Added friendly "Thanks for visiting" message after logout
- **2026-04-04**: Story implementation complete

---

## Dev Agent Record

### Implementation Notes

**Backend Implementation:**
- Implemented token blocklist in security.py using in-memory dictionary with TTL-based cleanup
- Token invalidation happens server-side by adding token to blocklist
- decode_access_token now checks blocklist before validating token
- Logout endpoint requires valid JWT token in Authorization header
- Returns 401 if token is already invalidated or missing

**Frontend Implementation:**
- Created Header component with user dropdown menu
- Logout button in dropdown clears auth state and redirects to login
- performLogout action calls backend first, then clears local state
- Uses Zustand persist middleware for localStorage persistence

**Security:**
- Tokens are invalidated server-side via blocklist (not just client-side removal)
- Blocked tokens cannot be used for authenticated requests
- decode_access_token returns None for blocked tokens, causing 401 responses

### Debug Log

- Initial blocklist test failure: Blocklist not cleared between tests
- Fix: Added setup_method to clear blocklist before each test

---

# Story Completion Status

**Created:** 2026-04-04
**Status:** done
**Story ID:** 1.3
**Story Key:** 1-3-user-logout

**Analysis Complete:** Story context includes all technical requirements, architecture patterns, previous story learnings, and developer guardrails needed for flawless implementation.

**Code Review Passed:** 2026-04-05

---

# Epic 1 Code Review Fixes (2026-04-05)

**Issues Fixed:**
1. **Story status updated** - Changed from "review" to "done"
