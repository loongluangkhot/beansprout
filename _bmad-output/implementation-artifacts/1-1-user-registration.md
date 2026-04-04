# Story 1.1: User Registration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a new user,
I want to create an account with my email and password,
So that I can access the beansprout platform.

## Acceptance Criteria

1. **Given** I am on the registration page, **When** I enter a valid email address and a password meeting security requirements (min 8 chars, includes letter and number), **Then** my account is created and I am automatically logged in, **And** I receive a confirmation message

2. **Given** I am on the registration page, **When** I enter an email that is already registered, **Then** I see an error message indicating the email is already in use, **And** I am not charged with creating a duplicate account

3. **Given** I am on the registration page, **When** I enter a password that doesn't meet security requirements, **Then** I see an error message explaining the password requirements, **And** the account is not created

## Tasks / Subtasks

- [x] Task 1: Backend User Model & Database Schema (AC: #1)
  - [x] Subtask 1.1: Create User SQLAlchemy model with email, password_hash, created_at, updated_at
  - [x] Subtask 1.2: Add unique constraint on email column
  - [x] Subtask 1.3: Create Alembic migration for users table
  - [x] Subtask 1.4: Add password validation utilities (min 8 chars, letter + number)

- [x] Task 2: Backend Registration Endpoint (AC: #1, #2, #3)
  - [x] Subtask 2.1: Create Pydantic schema for registration request/response
  - [x] Subtask 2.2: Implement `/auth/register` POST endpoint
  - [x] Subtask 2.3: Add email uniqueness validation
  - [x] Subtask 2.4: Add password strength validation
  - [x] Subtask 2.5: Hash password with bcrypt before storage
  - [x] Subtask 2.6: Create JWT token on successful registration
  - [x] Subtask 2.7: Return user data + token in response

- [x] Task 3: Frontend Registration Page (AC: #1, #2, #3)
  - [x] Subtask 3.1: Create registration page at `src/app/(auth)/register/page.tsx`
  - [x] Subtask 3.2: Implement email input with validation
  - [x] Subtask 3.3: Implement password input with strength indicator
  - [x] Subtask 3.4: Add real-time password validation feedback
  - [x] Subtask 3.5: Create submit button with loading state
  - [x] Subtask 3.6: Handle success: redirect to home + store token
  - [x] Subtask 3.7: Handle errors: display user-friendly messages

- [x] Task 4: Frontend Auth State Management (AC: #1)
  - [x] Subtask 4.1: Create Zustand auth store for token/user state
  - [x] Subtask 4.2: Implement token persistence (localStorage)
  - [x] Subtask 4.3: Create useAuth hook for components
  - [x] Subtask 4.4: Add auto-login on page refresh if token exists

- [x] Task 5: Testing (AC: All)
  - [x] Subtask 5.1: Write backend unit tests for registration endpoint
  - [x] Subtask 5.2: Write backend tests for password hashing
  - [x] Subtask 5.3: Write backend tests for email uniqueness validation
  - [x] Subtask 5.4: Add frontend component tests for registration form

## Dev Notes

- Registration is the first user-facing feature; ensure smooth UX
- Auto-login after registration improves conversion (no separate login step)
- Error messages must be clear and actionable per UX design principles
- Warm, welcoming tone in all UI copy

### Project Structure Notes

**Backend:**
- Model: `backend/app/models/user.py`
- Schema: `backend/app/schemas/user.py`
- Endpoint: `backend/app/api/v1/endpoints/auth.py`
- Service: `backend/app/services/auth_service.py`
- Utils: `backend/app/core/security.py`

**Frontend:**
- Page: `frontend/src/app/(auth)/register/page.tsx`
- Components: `frontend/src/components/features/auth/`
- Store: `frontend/src/stores/auth-store.ts`
- Hook: `frontend/src/hooks/useAuth.ts`
- API client: `frontend/src/lib/api/auth.ts`

### References

- [Architecture: Starter Template & Tech Stack - Source: _bmad-output/planning-artifacts/architecture.md#lines-62-108]
- [Architecture: Database Naming Conventions - Source: _bmad-output/planning-artifacts/architecture.md#lines-165-172]
- [Architecture: API Design Standards - Source: _bmad-output/planning-artifacts/architecture.md#lines-137-144]
- [Architecture: State Management - Source: _bmad-output/planning-artifacts/architecture.md#lines-195-199]
- [PRD: FR1 User Registration - Source: _bmad-output/planning-artifacts/prd.md#line-253]
- [PRD: Security Requirements - Source: _bmad-output/planning-artifacts/prd.md#lines-312-317]
- [UX: Emotional Design - Source: _bmad-output/planning-artifacts/ux-design-specification.md#lines-105-158]
- [UX: Form Validation - Source: _bmad-output/planning-artifacts/ux-design-specification.md#lines-698-706]

## Dev Agent Record

### Agent Model Used

big-pickle (opencode/big-pickle)

### Debug Log References

N/A - No debug issues encountered during implementation.

### Completion Notes List

**Implementation Summary (2026-04-03):**

✅ Successfully implemented user registration feature following red-green-refactor cycle

**Backend Implementation:**
- Created User SQLAlchemy model with UUID primary key, email, password_hash, timestamps
- Implemented email uniqueness constraint via database index
- Created Pydantic schemas for request/response validation with password strength validation
- Built `/api/v1/auth/register` endpoint with RFC 7807 error format
- Implemented bcrypt password hashing via passlib
- Created JWT token generation with 7-day expiration
- Set up Alembic migration for users table

**Frontend Implementation:**
- Created registration page with warm, welcoming UI design
- Implemented real-time password validation feedback with checklist
- Built Zustand auth store with localStorage persistence
- Created useAuth hook for registration flow
- Added React Hook Form + Zod for form validation
- Implemented auto-redirect to home on successful registration

**Testing:**
- Backend: Comprehensive tests for password hashing, validation, JWT tokens, schema validation, and AuthService
- Frontend: Tests for form validation, password requirements display, store state management

**Technical Decisions:**
- Used async/await consistently throughout FastAPI backend
- Implemented token persistence via Zustand with localStorage middleware
- Followed warm color palette and pill-shaped inputs per UX spec
- All API responses use data envelope format per architecture

### Code Review Fixes Applied (2026-04-03)

**Issues Fixed:**
1. **CRITICAL: get_db() placeholder** - Implemented proper async database session dependency with SQLAlchemy async engine
2. **HIGH: Hardcoded SECRET_KEY** - Fixed to import from config.py settings
3. **HIGH: Frontend type mismatch** - Fixed AuthResponse type to match backend data envelope format
4. **MEDIUM: No confirmation message** - Added success toast after registration before redirect
5. **MEDIUM: Duplicate password validation** - Removed redundant validation from auth_service (now only in Pydantic schema)
6. **MEDIUM: Auto-login on refresh** - Added SessionValidator component to validate JWT on app load
7. **LOW: datetime.utcnow deprecation** - Updated to use timezone-aware datetime (datetime.now(timezone.utc))

**Files Modified:**
- `backend/app/api/v1/endpoints/auth.py` - Fixed get_db() and added DB session factory
- `backend/app/core/security.py` - Use config settings for JWT secrets
- `backend/app/models/user.py` - Timezone-aware timestamps
- `backend/app/services/auth_service.py` - Removed duplicate validation
- `backend/tests/test_auth.py` - Updated tests to match code changes
- `src/types/auth.ts` - Fixed AuthResponse type definition
- `src/lib/api/auth.ts` - Updated to use correct types
- `src/stores/auth-store.ts` - Added validateSession action
- `src/components/features/auth/register-form.tsx` - Added success message
- `src/components/providers/session-validator.tsx` - New file for session validation
- `src/app/layout.tsx` - Added SessionValidator provider

### File List

| File | Action | Notes |
|------|--------|-------|
| `backend/app/__init__.py` | CREATE | Backend package init |
| `backend/app/models/__init__.py` | CREATE | Models package init |
| `backend/app/models/user.py` | CREATE | User SQLAlchemy model |
| `backend/app/schemas/__init__.py` | CREATE | Schemas package init |
| `backend/app/schemas/user.py` | CREATE | Pydantic schemas |
| `backend/app/services/__init__.py` | CREATE | Services package init |
| `backend/app/services/auth_service.py` | CREATE | Auth business logic |
| `backend/app/api/__init__.py` | CREATE | API package init |
| `backend/app/api/v1/__init__.py` | CREATE | API v1 package init |
| `backend/app/api/v1/router.py` | CREATE | API v1 router |
| `backend/app/api/v1/endpoints/__init__.py` | CREATE | Endpoints package init |
| `backend/app/api/v1/endpoints/auth.py` | CREATE | Auth endpoints |
| `backend/app/core/__init__.py` | CREATE | Core package init |
| `backend/app/core/security.py` | CREATE | Password hashing, JWT |
| `backend/app/config.py` | CREATE | Pydantic settings |
| `backend/app/main.py` | CREATE | FastAPI entry point |
| `backend/alembic/versions/001_create_users.py` | CREATE | Migration |
| `backend/alembic/env.py` | CREATE | Alembic config |
| `backend/alembic.ini` | CREATE | Alembic settings |
| `backend/tests/test_auth.py` | CREATE | Backend tests |
| `backend/pyproject.toml` | CREATE | Python project config (uv) |
| `src/app/layout.tsx` | CREATE | Root layout |
| `frontend/src/app/globals.css` | CREATE | Global styles |
| `frontend/src/app/page.tsx` | CREATE | Home page |
| `frontend/src/app/(auth)/layout.tsx` | CREATE | Auth layout |
| `frontend/src/app/(auth)/register/page.tsx` | CREATE | Registration page |
| `frontend/src/components/ui/button.tsx` | CREATE | Button component |
| `frontend/src/components/ui/input.tsx` | CREATE | Input component |
| `frontend/src/components/ui/label.tsx` | CREATE | Label component |
| `frontend/src/components/ui/card.tsx` | CREATE | Card component |
| `frontend/src/components/features/auth/auth-card.tsx` | CREATE | Auth card container |
| `frontend/src/components/features/auth/register-form.tsx` | CREATE | Registration form |
| `frontend/src/components/features/auth/register-form.test.tsx` | CREATE | Frontend tests |
| `frontend/src/stores/auth-store.ts` | CREATE | Zustand auth store |
| `frontend/src/hooks/useAuth.ts` | CREATE | Auth hook |
| `frontend/src/lib/utils.ts` | CREATE | Utility functions |
| `frontend/src/lib/api/client.ts` | CREATE | API client base |
| `frontend/src/lib/api/auth.ts` | CREATE | Auth API client |
| `frontend/src/types/auth.ts` | CREATE | Auth TypeScript types |
| `frontend/package.json` | CREATE | Node dependencies |
| `frontend/tsconfig.json` | CREATE | TypeScript config |
| `frontend/next.config.js` | CREATE | Next.js config |

---

# Technical Requirements

## Backend Requirements

### Technology Stack (from Architecture)
- **Framework:** FastAPI with async support
- **ORM:** SQLAlchemy 2.0 with asyncpg
- **Auth:** JWT via python-jose, password hashing via passlib[brypt]
- **Validation:** Pydantic v2

### Database Schema
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

### Password Requirements (from AC)
- Minimum 8 characters
- Must include at least one letter
- Must include at least one number

### API Endpoint
```
POST /api/v1/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Success Response (201):
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

Error Response (400/409):
{
  "error": {
    "type": "validation_error",
    "title": "Bad Request",
    "status": 400,
    "detail": "Password must contain at least one letter and one number"
  }
}
```

### Error Format (RFC 7807)
Follow Problem Details standard as specified in architecture.

## Frontend Requirements

### Technology Stack (from Architecture)
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Components:** shadcn/ui (Button, Input, Card, Toast)
- **Forms:** React Hook Form + Zod
- **State:** Zustand for auth state, React Query for server state
- **Styling:** Tailwind CSS with custom warm color palette

### Design System (from UX)
- **Colors:** Use warm palette (primary: `#4e6240`, surface: `#faf9f5`)
- **Inputs:** Pill-shaped, `surface-container-high` background
- **Buttons:** Gradient fill for primary CTA, roundedness-full
- **Typography:** Manrope for UI, Newsreader for headlines
- **Feedback:** Toast with warm messaging, skeleton for loading

### UX Requirements
- Registration page must feel warm and welcoming
- Password validation feedback should be real-time
- Error messages must be clear and calm (not alarming)
- Success should redirect to home page automatically
- Use warm, non-judgmental language throughout

### Registration Page Layout
```
┌─────────────────────────────────┐
│                                 │
│     "Join beansprout"           │
│     [Headline - Newsreader]     │
│                                 │
│     "Start your reading         │
│      journey"                   │
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
│  │ ✓ 8+ characters        │    │
│  │ ✓ Contains letter       │    │
│  │ ✓ Contains number      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │   Create Account        │    │
│  └─────────────────────────┘    │
│                                 │
│  "Already have an account?"     │
│  [Sign in]                      │
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
  register: (email: string, password: string) => Promise<void>;
}
```

### Validation Schema (Zod)
```typescript
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});
```

---

# Architecture Compliance

## MUST Follow
1. **Database naming:** snake_case, plural (`users`, `password_hash`)
2. **API naming:** kebab-case endpoints (`/auth/register`)
3. **API response format:** `{data, meta}` for success, RFC 7807 for errors
4. **Error handling:** Consistent RFC 7807 Problem Details format
5. **JWT token:** Include in Authorization header as `Bearer <token>`

## MUST NOT Do
1. Do NOT use plain text passwords (must hash with bcrypt)
2. Do NOT return password or hash in any response
3. Do NOT use `create-next-app` default styling (use Tailwind + shadcn/ui)
4. Do NOT use JavaScript `Date` (use proper date handling)

---

# Library/Framework Requirements

## Backend Dependencies (from architecture)
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.0
asyncpg>=0.29.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
pydantic>=2.0.0
pydantic-settings>=2.0.0
alembic>=1.13.0
python-multipart>=0.0.6
```

## Frontend Dependencies
```bash
# Already in shadcn/ui init
npx shadcn@latest add button card input label toast

# Form handling
npm install react-hook-form zod @hookform/resolvers

# State management
npm install zustand @tanstack/react-query
```

## Version Requirements
- **Node.js:** 20.x LTS
- **Python:** 3.11+
- **Next.js:** 15.x
- **React:** 19.x
- **TypeScript:** 5.x

---

# File Structure Requirements

## Backend Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Pydantic settings
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py         # User SQLAlchemy model
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py         # Pydantic schemas
│   ├── services/
│   │   ├── __init__.py
│   │   └── auth_service.py # Auth business logic
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           └── auth.py  # Auth endpoints
│   └── core/
│       ├── __init__.py
│       └── security.py      # Password/JWT utilities
├── alembic/
│   └── versions/
│       └── *_create_users.py
├── tests/
│   └── test_auth.py
├── requirements.txt
└── alembic.ini
```

## Frontend Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Home page
│   │   └── (auth)/
│   │       ├── layout.tsx   # Auth layout
│   │       ├── login/
│   │       │   └── page.tsx
│   │       └── register/
│   │           └── page.tsx # Registration page
│   ├── components/
│   │   └── features/
│   │       └── auth/
│   │           ├── register-form.tsx
│   │           └── auth-card.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── stores/
│   │   └── auth-store.ts
│   ├── lib/
│   │   └── api/
│   │       ├── client.ts
│   │       └── auth.ts
│   └── types/
│       └── auth.ts
└── package.json
```

---

# Testing Requirements

## Backend Tests
- Test password hashing with bcrypt
- Test password validation (valid/invalid passwords)
- Test email uniqueness (duplicate email rejection)
- Test successful registration returns user + token
- Test error responses match RFC 7807 format

## Frontend Tests
- Test form validation (email format, password requirements)
- Test error display for validation failures
- Test successful registration redirects to home
- Test auth state is updated after registration

## Test Coverage
- Minimum 80% code coverage on auth service
- All acceptance criteria must have corresponding tests

---

# Previous Story Intelligence

**N/A - This is the first story in Epic 1**

No previous story learnings available. This establishes the foundation for all subsequent stories in Epic 1 (Login, Logout, Profile Management, Photo Upload).

---

# Latest Technical Information

## Next.js 15 Considerations (March 2026)
- Use App Router patterns (not Pages Router)
- Server Components by default, Client Components where needed
- `use client` directive for interactive components (forms, hooks)
- Server Actions for form submissions (optional, but not required)

## FastAPI Best Practices
- Use dependency injection for database sessions
- Implement proper CORS configuration for frontend origin
- Use async/await consistently throughout
- Configure proper logging for debugging

## Security Reminders
- Never log sensitive data (passwords, tokens)
- Use HTTPS in production (handled by hosting)
- Implement rate limiting (can be added post-MVP)
- Validate all input on server side (don't trust client)

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

**Created:** 2026-04-03
**Status:** done
**Story ID:** 1.1
**Story Key:** 1-1-user-registration
**Completed:** 2026-04-03
**Code Review Passed:** 2026-04-03 (7 issues fixed)

**Story Context Engine Analysis Complete:** Comprehensive developer guide created with all architectural decisions, UX requirements, security considerations, and testing standards.
