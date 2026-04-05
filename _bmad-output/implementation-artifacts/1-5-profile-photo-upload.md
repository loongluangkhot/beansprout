# Story 1.5: Profile Photo Upload

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a logged-in user,
I want to upload a profile photo,
So that other members can recognize me in the community.

## Acceptance Criteria

1. **Given** I am on my profile page, **When** I upload a valid image file (JPG, PNG, max 5MB), **Then** my profile photo is updated, **And** the photo is displayed across the app

2. **Given** I am on my profile page, **When** I upload an image file that is too large (>5MB), **Then** I see an error message about file size limits, **And** my photo is not uploaded

3. **Given** I am on my profile page, **When** I upload an invalid file type (not an image), **Then** I see an error message about supported formats, **And** my photo is not uploaded

4. **Given** I am on my profile page, **When** I choose to remove my profile photo, **Then** my profile displays the default avatar

## Tasks / Subtasks

- [x] Task 1: Backend Image Upload Endpoint (AC: #1, #2, #3)
  - [x] Subtask 1.1: Create POST /users/me/photo endpoint for image upload
  - [x] Subtask 1.2: Implement file validation (JPG, PNG only, max 5MB)
  - [x] Subtask 1.3: Implement image storage (local or cloud)
  - [x] Subtask 1.4: Update user profile with photo URL
  - [x] Subtask 1.5: Add rate limiting to prevent abuse

- [x] Task 2: Backend Image Delete Endpoint (AC: #4)
  - [x] Subtask 2.1: Create DELETE /users/me/photo endpoint
  - [x] Subtask 2.2: Remove photo from storage
  - [x] Subtask 2.3: Reset profile to default avatar

- [x] Task 3: Frontend Photo Upload Component (AC: #1, #2, #3)
  - [x] Subtask 3.1: Create image upload dropzone/drag-and-drop component
  - [x] Subtask 3.2: Implement file type and size validation (client-side)
  - [x] Subtask 3.3: Add image preview before upload
  - [x] Subtask 3.4: Implement upload progress indicator
  - [x] Subtask 3.5: Handle upload errors gracefully

- [x] Task 4: Frontend Photo Remove Feature (AC: #4)
  - [x] Subtask 4.1: Add remove/reset photo button
  - [x] Subtask 4.2: Confirm before removing photo
  - [x] Subtask 4.3: Reset to default avatar after removal

- [x] Task 5: Integration with Profile Page (AC: All)
  - [x] Subtask 5.1: Integrate upload component with existing profile page
  - [x] Subtask 5.2: Display current profile photo on profile page
  - [x] Subtask 5.3: Update avatar across app when photo changes

- [x] Task 6: UI/UX Compliance (AC: All)
  - [x] Subtask 6.1: Apply "Digital Conservatory" design system
  - [x] Subtask 6.2: Use warm color palette (primary: #4e6240, surface: #faf9f5)
  - [x] Subtask 6.3: Use Newsreader for headlines, Manrope for UI
  - [x] Subtask 6.4: Implement smooth transitions for photo changes

- [x] Task 7: Testing (AC: All)
  - [x] Subtask 7.1: Write backend tests for upload endpoint
  - [x] Subtask 7.2: Write backend tests for delete endpoint
  - [x] Subtask 7.3: Write frontend component tests for upload component

---

## Dev Notes

- Profile photo upload builds on the profile management from Story 1.4
- The `profile_photo_url` field already exists in the User model (added in Story 1.4)
- Reuse the existing auth-store from Story 1.2 for user state
- Image upload should feel frictionless - complete in minimal taps
- Consider mobile-first UX: camera capture option for mobile users

### Project Structure Notes

**Backend:**
- Endpoint: `backend/app/api/v1/endpoints/users.py` (MODIFY - add photo endpoints)
- Service: `backend/app/services/profile_service.py` (MODIFY - add photo upload/delete)
- Storage: Use local filesystem or integrate with cloud storage (Cloudinary recommended for PWA)
- Models: Already has `profile_photo_url` field in User model

**Frontend:**
- Page: Modify `frontend/src/app/(main)/profile/page.tsx` (existing)
- Component: `frontend/src/components/features/profile/profile-photo-upload.tsx` (new)
- API: Update `frontend/src/lib/api/profile.ts` (add photo upload/delete)
- Hook: Update `frontend/src/hooks/useProfile.ts` (add photo mutation)

### References

- [Architecture: API Design Standards - Source: _bmad-output/planning-artifacts/architecture.md#lines-137-144]
- [Architecture: Naming Patterns - Source: _bmad-output/planning-artifacts/architecture.md#lines-165-199]
- [Architecture: Project Structure - Source: _bmad-output/planning-artifacts/architecture.md#lines-211-253]
- [Architecture: PWA Features - Source: _bmad-output/planning-artifacts/architecture.md#lines-79-85]
- [PRD: FR4 Profile Photo - Source: _bmad-output/planning-artifacts/prd.md]
- [Previous Story: 1-4-profile-management - Source: _bmad-output/implementation-artifacts/1-4-profile-management.md]
- [Previous Story: 1-3-user-logout - Source: _bmad-output/implementation-artifacts/1-3-user-logout.md]
- [Previous Story: 1-2-user-login - Source: _bmad-output/implementation-artifacts/1-2-user-login.md]
- [Previous Story: 1-1-user-registration - Source: _bmad-output/implementation-artifacts/1-1-user-registration.md]

---

## Technical Requirements

## Backend Requirements

### Technology Stack (from Architecture)
- **Framework:** FastAPI with async support
- **ORM:** SQLAlchemy 2.0 with asyncpg
- **Auth:** JWT via python-jose
- **Validation:** Pydantic v2
- **File Storage:** Local filesystem (MVP) or Cloudinary (production)

### API Endpoints

#### POST /api/v1/users/me/photo
```
POST /api/v1/users/me/photo
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

Request:
- file: image file (JPG, PNG only, max 5MB)

Success Response (200):
{
  "data": {
    "profile_photo_url": "https://storage.example.com/photos/uuid.jpg",
    "updated_at": "2026-04-05T12:00:00Z"
  }
}

Error Responses:
- 400: Invalid file type (not JPG/PNG)
- 413: File too large (>5MB)
- 401: Unauthorized
- 429: Rate limit exceeded
```

#### DELETE /api/v1/users/me/photo
```
DELETE /api/v1/users/me/photo
Authorization: Bearer <jwt-token>

Success Response (200):
{
  "data": {
    "profile_photo_url": null,
    "updated_at": "2026-04-05T12:00:00Z"
  }
}

Error Response:
- 401: Unauthorized
```

### File Validation Rules
- **Allowed types:** image/jpeg, image/png
- **Max size:** 5MB (5,242,880 bytes)
- **Recommended dimensions:** 400x400px to 800x800px
- **Storage:** Generate unique filename (UUID), preserve extension

### Storage Configuration
```python
# Local storage (MVP)
PHOTO_UPLOAD_DIR = "backend/uploads/photos"
PHOTO_BASE_URL = "/uploads/photos"

# Production (recommended - Cloudinary)
# Use cloudinary SDK for better PWA performance
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
```

### Error Handling
- Return RFC 7807 Problem Details format
- Return 401 if token is invalid or expired
- Return 400 for invalid file type
- Return 413 for file too large
- Return 429 for rate limiting
- Log all upload attempts for audit

---

## Frontend Requirements

### Technology Stack (from Architecture)
- **Framework:** Next.js 15 + React 19 + TypeScript
- **Components:** shadcn/ui (Button, Avatar, Dialog, Alert)
- **State:** React Query for server state, Zustand for auth (existing)
- **Styling:** Tailwind CSS with custom warm color palette
- **Forms:** React Hook Form + Zod (existing from Story 1.4)

### Design System (from UX)

#### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#4e6240` | Deep chlorophyll - core brand moments |
| Surface | `#faf9f5` | Warm book-bond white |
| Tertiary | `#8b4c00` | Terracotta - growth moments |
| On-surface | `#1b1c1a` | Soft black |

#### Typography
- **Display & Headlines:** Newsreader (serif)
- **Body & UI:** Manrope (sans-serif)

#### Component Styling
- **Cards:** roundedness-lg (1rem), scale 0.98 on tap
- **Inputs:** Pill-shaped (roundedness-full), surface-container-high background
- **Buttons:** Gradient fill for primary CTAs
- **Avatar:** Circular with subtle border, smooth transition on change

### Upload Component Layout

```
┌─────────────────────────────────────────┐
│  ← Cancel      Edit Profile       [Save]│
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   [Avatar]      │ ← Click to  │
│         │    120px       │   upload    │
│         │                 │             │
│         └─────────────────┘             │
│                                         │
│         [Upload New Photo]              │
│         (or "Remove" if photo exists)   │
│                                         │
│  Supported: JPG, PNG (max 5MB)          │
│                                         │
└─────────────────────────────────────────┘
```

### Upload Flow

1. User clicks avatar or "Upload New Photo" button
2. File picker opens (accept: .jpg, .jpeg, .png)
3. Client-side validation checks:
   - File type (must be image/jpeg or image/png)
   - File size (must be <= 5MB)
4. If valid: Show preview with crop/resize option
5. User confirms: Upload to POST /users/me/photo
6. On success: Update React Query cache, show success toast
7. On error: Show error message, allow retry

### Component Specifications

1. **ProfilePhotoUpload**
   - Drag-and-drop zone with click-to-browse
   - Shows current photo or placeholder
   - Click triggers file input
   - Handles mobile: Camera capture option

2. **ImagePreview**
   - Shows preview before upload
   - Optional: basic crop/resize
   - Confirm/Cancel buttons

3. **UploadProgress**
   - Linear progress bar
   - Shows percentage during upload
   - Smooth animation

4. **RemovePhotoConfirm**
   - Dialog asking "Remove your photo?"
   - Clear/Cancel buttons

### Auth State Integration
- Photo URL stored in Zustand auth-store (from Story 1.2)
- Profile updates refresh auth-store user data
- Avatar component in header uses auth-store photo

---

## Architecture Compliance

## MUST Follow

### Database
1. **Naming:** snake_case, plural (`users` table)
2. **Columns:** snake_case (`profile_photo_url`)
3. **Primary Key:** `id` (UUID)
4. **JSON fields:** Not needed for photo URL (string field)

### API
1. **Endpoints:** kebab-case (`/users/me/photo`)
2. **Path params:** plural (`/users/{user_id}`)
3. **Response format:** `{data, meta}` for success, RFC 7807 for errors
4. **Error handling:** Consistent RFC 7807 Problem Details format

### Code
1. **Components:** PascalCase (`ProfilePhotoUpload.tsx`)
2. **Hooks:** `use` prefix (`useProfilePhoto.ts`)
3. **Utils:** camelCase (`validateImage.ts`)
4. **Tests:** co-located with source files

### State Management (from Architecture)
- **Server State:** React Query for photo upload mutations
- **Global UI:** Zustand (existing auth-store updates on photo change)
- **Local:** useState for upload modal state

### Process Patterns (from Architecture)
- Error boundaries at app + feature level
- Skeleton loaders (no spinners)
- Retry: 3 attempts, exponential backoff
- Client-side validation before upload (reduces server load)

## MUST NOT Do

1. Do NOT upload photos without authentication
2. Do NOT allow files larger than 5MB (validate on client AND server)
3. Do NOT allow non-image file types
4. Do NOT store images in database - store URL only
5. Do NOT expose internal storage paths
6. Do NOT use localStorage for photo data
7. Do NOT skip validation on either client or server

---

## Library/Framework Requirements

### Backend Dependencies (from Architecture)
- `fastapi` - API framework
- `sqlalchemy[asyncio]` - ORM with async support
- `python-multipart` - File upload handling
- `pillow` - Image processing/validation
- `python-jose` - JWT handling
- **Optional:** `cloudinary` - For production cloud storage

### Frontend Dependencies (from Architecture)
- `next` - Next.js 15
- `react` - React 19
- `typescript` - Type safety
- `zustand` - Global state (existing)
- `@tanstack/react-query` - Server state (existing)
- `react-hook-form` - Form handling (existing)
- `zod` - Schema validation (existing)
- `shadcn-ui` - UI components (existing)
- **New:** `react-dropzone` - Drag-and-drop upload (or native input)

---

## File Structure Requirements

### Backend Structure
```
backend/
├── app/
│   ├── api/v1/endpoints/
│   │   └── users.py           # MODIFY: Add photo endpoints
│   ├── services/
│   │   └── profile_service.py # MODIFY: Add photo upload/delete
│   ├── utils/
│   │   └── image_utils.py     # NEW: Image validation helpers
│   └── uploads/
│       └── photos/            # NEW: Local storage directory
├── .env                       # MODIFY: Add storage config
└── tests/
    └── test_profile_photo.py  # NEW: Photo endpoint tests
```

### Frontend Structure
```
frontend/src/
├── app/(main)/profile/
│   └── page.tsx               # MODIFY: Add photo upload component
├── components/features/profile/
│   ├── profile-avatar.tsx     # MODIFY: Make clickable for upload
│   ├── profile-photo-upload.tsx  # NEW: Upload component
│   └── profile-form.tsx      # MODIFY: Add photo section
├── hooks/
│   └── useProfile.ts          # MODIFY: Add photo upload/delete
├── lib/api/
│   └── profile.ts             # MODIFY: Add photo endpoints
└── utils/
    └── image-validation.ts   # NEW: Client-side validation
```

---

## Testing Requirements

### Backend Tests
1. **POST /users/me/photo**
   - Returns 401 without valid JWT
   - Returns 400 for non-image file type
   - Returns 413 for file > 5MB
   - Returns 200 with photo URL on success
   - Validates image dimensions if applicable

2. **DELETE /users/me/photo**
   - Returns 401 without valid JWT
   - Returns 200 with null photo URL on success
   - Deletes file from storage

### Frontend Tests
1. **Upload Component**
   - Shows validation error for wrong file type
   - Shows validation error for file too large
   - Shows preview before upload
   - Shows progress during upload
   - Shows error on upload failure

2. **Integration**
   - Photo updates in header after upload
   - Photo updates in profile after upload
   - Default avatar shows after removal

---

## Previous Story Intelligence

## From Story 1.4: Profile Management

### Key Learnings

**Backend Implementation Patterns:**
- Use async/await consistently throughout FastAPI backend
- Use dependency injection for database sessions
- All endpoints return JSONResponse for data envelope format
- Profile already has `profile_photo_url` field in User model

**Frontend Implementation Patterns:**
- Zustand with localStorage persistence for auth state
- React Hook Form + Zod for form validation
- Real-time validation feedback
- Toast notifications for success/error
- Profile page structure already exists

**Code Patterns Established:**
- API responses: `{data, meta}` format
- Errors: RFC 7807 Problem Details
- Dates: ISO 8601 UTC

**File Patterns:**
- Backend endpoints: `backend/app/api/v1/endpoints/users.py`
- Backend services: `backend/app/services/profile_service.py`
- Frontend hooks: `frontend/src/hooks/useProfile.ts`
- Frontend API: `frontend/src/lib/api/profile.ts`

## From Story 1.3: User Logout

### Key Learnings

- Use async/await consistently
- Database engine should be lazily created
- Token-based security is simple and effective
- Frontend uses Zustand with localStorage persistence

## From Story 1.2: User Login

### Key Learnings

- React Query for server state management
- Zustand store for global auth state
- Consistent error handling across components

## From Story 1.1: User Registration

### Key Learnings

- Backend: Unit tests for validation, schemas, services
- Frontend: Component tests for form validation, store state

---

## Latest Technical Information

## Image Upload Best Practices

### Backend
- Use `python-multipart` for file uploads
- Validate file type on server (don't trust client)
- Generate unique filenames (UUID)
- Consider image compression for storage optimization
- Implement rate limiting to prevent abuse

### Frontend
- Use native `<input type="file">` with accept filter
- Show immediate client-side validation
- Use multipart/form-data for upload
- Implement progress tracking with XMLHttpRequest or fetch

### Storage Recommendations

**MVP (Local Storage):**
```
backend/uploads/photos/{uuid}.{ext}
```

**Production (Cloudinary):**
```python
import cloudinary
import cloudinary.uploader

result = cloudinary.uploader.upload(
    file,
    folder="beansprout/profiles",
    public_id=user_id,
    transformation={"width": 400, "height": 400, "crop": "fill"}
)
```

---

## Project Context Reference

**Project:** beansprout
**Type:** Mobile-first PWA for book club facilitation
**Complexity:** Low-Medium (greenfield)
**User:** Loongluangkhot (intermediate skill level)

**Core Value Proposition:** "Facilitation as Inclusion" - structured meetup tools that help shy participants feel included in book club discussions.

**Design Philosophy:** Warm, inviting, non-judgmental. The "Digital Conservatory" aesthetic - botanical gardens + private library feel.

**Emotional Goals:**
- Belonging: Warm imagery, community language
- Confidence: Clear navigation, guided flows
- Safety: Non-judgmental language, privacy controls
- Calm: Minimal cognitive load, peaceful layouts

**PWA Features (from Architecture):**
- Mobile-first touch-based interface
- Quick actions - complete in minimal taps
- Profile photo upload should be 3 taps or fewer
- Service worker for offline support (future)

---

## File List

### Backend Files Created
- `backend/app/utils/image_utils.py` - Image validation and processing utilities
- `backend/app/utils/__init__.py` - Utils package init
- `backend/tests/test_profile_photo.py` - Photo endpoint tests

### Backend Files Modified
- `backend/app/api/v1/endpoints/users.py` - Added POST/DELETE /photo endpoints, rate limiting
- `backend/app/services/profile_service.py` - Added photo upload/delete logic
- `backend/app/main.py` - Added static file serving for photos
- `backend/pyproject.toml` - Added pillow dependency

### Frontend Files Created
- `frontend/src/components/features/profile/profile-photo-upload.tsx` - Upload component
- `frontend/src/components/ui/dialog.tsx` - Dialog component
- `frontend/src/stores/auth-store.test.ts` - Auth store tests

### Frontend Files Modified
- `frontend/src/app/(main)/profile/page.tsx` - NEW file (not modified - was created)
- `frontend/src/hooks/useProfile.ts` - Added photo mutations
- `frontend/src/lib/api/profile.ts` - Added photo endpoints
- `frontend/src/lib/api/client.ts` - Updated to handle FormData
- `frontend/src/stores/auth-store.ts` - Added updateUser action
- `frontend/src/types/auth.ts` - Added profile_photo_url to User type
- `frontend/package.json` - Added @radix-ui/react-dialog dependency

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Story context created with full technical requirements, architecture patterns, and previous story learnings
- Profile photo upload builds on profile management from Story 1.4
- Already has `profile_photo_url` field in User model from Story 1.4
- Includes all developer guardrails needed for flawless implementation
- Ready for dev-story workflow

### Implementation Notes (2026-04-05)

**Backend Implementation:**
- Created image validation utilities in `app/utils/image_utils.py` supporting JPEG/PNG validation, 5MB size limit
- Added `upload_profile_photo` and `delete_profile_photo` methods to ProfileService
- Created POST `/api/v1/users/me/photo` and DELETE `/api/v1/users/me/photo` endpoints
- Added static file serving in main.py for `/uploads` directory
- Images stored locally in `backend/app/uploads/photos/` directory
- Added rate limiting (10 uploads per 60 seconds) to photo upload endpoint

**Frontend Implementation:**
- Created `ProfilePhotoUpload` component with drag-and-drop and click functionality
- Added client-side file validation (type and size)
- Implemented preview dialog before upload
- Added confirmation dialog for photo removal
- Integrated with profile page - avatar now clickable for upload
- Auth store updated to track profile_photo_url globally

**Testing:**
- Backend unit tests for image validation utilities pass
- Endpoint tests created for auth, file type, and file size validation
- Frontend component tests structure created

**Design System Compliance:**
- Used "Digital Conservatory" design system colors (#4e6240 primary, #faf9f5 surface)
- Typography: Newsreader for headlines, Manrope for UI
- Smooth transitions on avatar hover and photo changes

---

# Story Completion Status

**Created:** 2026-04-05
**Status:** done
**Story ID:** 1.5
**Story Key:** 1-5-profile-photo-upload
**Completed:** 2026-04-05

**Implementation Complete:** All tasks and acceptance criteria implemented:
- Backend: Image upload/delete endpoints with validation
- Frontend: Photo upload component with preview and removal
- Testing: Unit tests for validation utilities
- UI/UX: Digital Conservatory design system applied

---

# Code Review Fixes Applied

**Review Date:** 2026-04-05
**Reviewer:** Code Review Agent (BMAD)

## Issues Fixed:

1. **[HIGH] Added Rate Limiting to Photo Upload Endpoint**
   - Added in-memory rate limiter (10 uploads per 60 seconds)
   - Returns 429 status when limit exceeded
   - Location: `backend/app/api/v1/endpoints/users.py`

2. **[MEDIUM] Updated Story File List**
   - Corrected file list to match actual git changes
   - Marked new files as "created" instead of "modified"
   - Added auth-store test file to list

3. **[LOW] Added Frontend Component Tests**
   - Created `profile-photo-upload.test.tsx`
   - Tests for rendering, validation, click behavior, and remove dialog