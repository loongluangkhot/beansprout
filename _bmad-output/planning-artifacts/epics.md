---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# beansprout - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for beansprout, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can create an account with email and password
FR2: Users can log in and log out of their account
FR3: Users can view and edit their profile (bio, favorite genres, reading history)
FR4: Users can upload a profile photo
FR5: Users can browse public seasons in a season library
FR6: Users can search and filter seasons by theme, genre, or schedule
FR7: Users can view detailed season information (book, schedule, member count, location)
FR8: Users can view season creator and member profiles
FR9: Season creators can create a new season with title, book, and description
FR10: Season creators can set the season duration and meetup schedule
FR11: Season creators can set a maximum number of members
FR12: Season creators can add a location URL/link for meetup venues
FR13: Season creators can publish a season to make it publicly discoverable
FR14: Season creators can close a season to new members
FR15: Season creators can choose membership approval mode (auto-join or approval required) (Future feature)
FR16: Users can join a season (auto-join in MVP)
FR17: Users can RSVP to individual meetups
FR18: Users can cancel their RSVP to a meetup
FR19: Users can view their RSVP history
FR20: Season creators can view RSVP counts for each meetup
FR21: Users can view available Seeds for meetups
FR22: Users can select a Seed to prepare for a meetup (includes format + prompts)
FR23: Users can access the Seed's format and prompts during a meetup
FR24: Users can choose "Chill Chat" mode (no Seed, informal discussion)
FR25: Users can receive push notifications for upcoming meetup reminders
FR26: Users can receive push notifications for RSVP confirmations
FR27: Users can opt out of specific notification types
FR28: Users receive real-time updates when RSVPs are confirmed
FR29: Users receive real-time updates for season activity (new members, schedule changes)
FR30: The system updates RSVP counts in real-time across all viewing users

### NonFunctional Requirements

Performance:
- NFR1: Pages load within 2 seconds on 4G connection
- NFR2: First Contentful Paint <2 seconds
- NFR3: Time to Interactive <3 seconds
- NFR4: Real-time updates (RSVP and season activity) appear within 10 seconds
- NFR5: Push notifications delivered within 30 seconds of trigger event

Security:
- NFR6: Secure login with password hashing (bcrypt)
- NFR7: All user data stored securely, no sensitive data in logs
- NFR8: JWT-based authentication with secure token handling
- NFR9: HTTPS encryption for all communications in transit

Scalability:
- NFR10: System supports 10x user growth without architecture changes
- NFR11: Database and API designed for horizontal scaling

### Additional Requirements

From Architecture:
- Frontend: Next.js 15 + React 19 + TypeScript with create-next-app
- Backend: FastAPI (Python) with async support, manual setup
- Database: PostgreSQL with async SQLAlchemy
- WebSocket support for real-time features
- Web Push API for notifications
- PWA features (service workers, app manifest, push notifications)
- Tailwind CSS + shadcn/ui design system
- Real-time state synchronization (RSVPs, season activity)
- Image upload and storage for profile photos
- PWA installation and offline capabilities
- Starter Template: create-next-app for frontend, manual FastAPI setup for backend

From UX Design:
- Mobile-first PWA (touch-based)
- Quick RSVP - Complete in 3 taps or fewer
- One-Tap Seeds Access - During meetups, access prompts with minimal friction
- Automatic Reminders - Notifications that feel helpful, not intrusive
- One-Handed Use - Core actions operable with one thumb
- Responsive design for mobile, tablet, desktop
- Accessibility: WCAG 2.1 AA compliance
- Browser support: Chrome on iOS, Android, and Desktop
- Warm, inviting tone - "safe space for connection"
- Non-judgmental language throughout
- Seeds accessible in under 3 seconds during meetups
- Progressive disclosure - Don't overwhelm new users with all prompts

### FR Coverage Map

| FR | Epic |
|----|------|
| FR1 | Epic 1 - User Identity & Authentication |
| FR2 | Epic 1 - User Identity & Authentication |
| FR3 | Epic 1 - User Identity & Authentication |
| FR4 | Epic 1 - User Identity & Authentication |
| FR5 | Epic 2 - Season Discovery & Joining |
| FR6 | Epic 2 - Season Discovery & Joining |
| FR7 | Epic 2 - Season Discovery & Joining |
| FR8 | Epic 2 - Season Discovery & Joining |
| FR9 | Epic 3 - Season Creation & Management |
| FR10 | Epic 3 - Season Creation & Management |
| FR11 | Epic 3 - Season Creation & Management |
| FR12 | Epic 3 - Season Creation & Management |
| FR13 | Epic 3 - Season Creation & Management |
| FR14 | Epic 3 - Season Creation & Management |
| FR16 | Epic 2 - Season Discovery & Joining |
| FR17 | Epic 4 - RSVP & Commitment Tracking |
| FR18 | Epic 4 - RSVP & Commitment Tracking |
| FR19 | Epic 4 - RSVP & Commitment Tracking |
| FR20 | Epic 4 - RSVP & Commitment Tracking |
| FR21 | Epic 5 - Seeds Facilitation |
| FR22 | Epic 5 - Seeds Facilitation |
| FR23 | Epic 5 - Seeds Facilitation |
| FR24 | Epic 5 - Seeds Facilitation |
| FR25 | Epic 6 - Notifications & Reminders |
| FR26 | Epic 6 - Notifications & Reminders |
| FR27 | Epic 6 - Notifications & Reminders |
| FR28 | Epic 7 - Real-Time Engagement |
| FR29 | Epic 7 - Real-Time Engagement |
| FR30 | Epic 7 - Real-Time Engagement |

## Epic List

### Epic 1: User Identity & Authentication
Users can create accounts, authenticate securely, and manage their personal profiles.
**FRs covered:** FR1, FR2, FR3, FR4

### Epic 2: Season Discovery & Joining
Users can browse, search, and filter public seasons to find communities that match their interests, then join them.
**FRs covered:** FR5, FR6, FR7, FR8, FR16

### Epic 3: Season Creation & Management
Season creators can set up and publish new seasons with complete book, schedule, and location information.
**FRs covered:** FR9, FR10, FR11, FR12, FR13, FR14

### Epic 4: RSVP & Commitment Tracking
Users can commit to attending specific meetups and track their attendance history; creators can monitor RSVPs.
**FRs covered:** FR17, FR18, FR19, FR20

### Epic 5: Seeds Facilitation
Users can access structured discussion prompts and formats to guide meaningful conversations during meetups.
**FRs covered:** FR21, FR22, FR23, FR24

### Epic 6: Notifications & Reminders
Users receive timely notifications for upcoming meetups and RSVP confirmations, with control over preferences.
**FRs covered:** FR25, FR26, FR27

### Epic 7: Real-Time Engagement
Users receive live updates about RSVPs and season activity, creating a dynamic, responsive experience.
**FRs covered:** FR28, FR29, FR30

---

## Epic 1: User Identity & Authentication

Users can create accounts, authenticate securely, and manage their personal profiles.

### Story 1.1: User Registration

As a new user,
I want to create an account with my email and password,
So that I can access the beansprout platform.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a valid email address and a password meeting security requirements (min 8 chars, includes letter and number)
**Then** my account is created and I am automatically logged in
**And** I receive a confirmation message

**Given** I am on the registration page
**When** I enter an email that is already registered
**Then** I see an error message indicating the email is already in use
**And** I am not charged with creating a duplicate account

**Given** I am on the registration page
**When** I enter a password that doesn't meet security requirements
**Then** I see an error message explaining the password requirements
**And** the account is not created

---

### Story 1.2: User Login

As a registered user,
I want to log in with my email and password,
So that I can access my account and personalized features.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I enter my correct email and password
**Then** I am successfully logged in
**And** I am redirected to the home/season discovery page

**Given** I am on the login page
**When** I enter an incorrect password
**Then** I see an error message indicating invalid credentials
**And** I remain on the login page

**Given** I am on the login page
**When** I enter an email that doesn't exist
**Then** I see an error message indicating invalid credentials
**And** I remain on the login page

**Given** I am on the login page
**When** I successfully log in
**Then** a JWT token is issued and stored securely
**And** subsequent requests include authentication

---

### Story 1.3: User Logout

As a logged-in user,
I want to log out of my account,
So that my session is terminated for security.

**Acceptance Criteria:**

**Given** I am logged in
**When** I click the logout button
**Then** my session is terminated
**And** I am redirected to the login page
**And** my JWT token is invalidated

**Given** I am logged in
**When** I log out
**Then** I cannot access authenticated routes
**And** I must log in again to access my account

---

### Story 1.4: Profile Management

As a logged-in user,
I want to view and edit my profile information,
So that I can showcase my reading interests to the community.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to my profile page
**Then** I see my current profile information (bio, favorite genres, reading history)

**Given** I am on my profile page
**When** I edit my bio and save changes
**Then** my bio is updated and I see a success confirmation

**Given** I am on my profile page
**When** I update my favorite genres
**Then** my genres are updated and reflected in my profile

**Given** I am on my profile page
**When** I add items to my reading history
**Then** my reading history is updated

**Given** I am on my profile page
**When** I attempt to save empty required fields
**Then** I see validation errors
**And** my changes are not saved

---

### Story 1.5: Profile Photo Upload

As a logged-in user,
I want to upload a profile photo,
So that other members can recognize me in the community.

**Acceptance Criteria:**

**Given** I am on my profile page
**When** I upload a valid image file (JPG, PNG, max 5MB)
**Then** my profile photo is updated
**And** the photo is displayed across the app

**Given** I am on my profile page
**When** I upload an image file that is too large (>5MB)
**Then** I see an error message about file size limits
**And** my photo is not uploaded

**Given** I am on my profile page
**When** I upload an invalid file type (not an image)
**Then** I see an error message about supported formats
**And** my photo is not uploaded

**Given** I am on my profile page
**When** I choose to remove my profile photo
**Then** my profile displays the default avatar

---

## Epic 2: Season Discovery & Joining

Users can browse, search, and filter public seasons to find communities that match their interests, then join them.

### Story 2.1: Season Library Browse

As a user,
I want to browse public seasons in the library,
So that I can discover book clubs I might want to join.

**Acceptance Criteria:**

**Given** I am on the home/season library page
**When** the page loads
**Then** I see a grid/list of public seasons
**And** each season card shows the book title, author, theme, and next meetup date

**Given** I am on the season library
**When** I scroll through the list
**Then** seasons are loaded with smooth pagination/infinite scroll
**And** loading indicators appear while fetching

**Given** I am on the season library
**When** there are no seasons available
**Then** I see a friendly empty state message
**And** I'm encouraged to start my own season

---

### Story 2.2: Season Search & Filter

As a user,
I want to search and filter seasons by theme, genre, or schedule,
So that I can find seasons that match my specific interests.

**Acceptance Criteria:**

**Given** I am on the season library page
**When** I enter a search term in the search bar
**Then** I see seasons matching that search term (title, book, theme)

**Given** I am on the season library page
**When** I select a genre filter (e.g., "Contemporary Fiction")
**Then** I see only seasons matching that genre

**Given** I am on the season library page
**When** I select a schedule filter (e.g., "This Week")
**Then** I see only seasons with meetups happening this week

**Given** I am on the season library page
**When** I apply multiple filters (search + genre + schedule)
**Then** I see seasons matching ALL selected criteria

**Given** I am on the season library page
**When** no seasons match my search/filters
**Then** I see a "no results" message
**And** I'm offered to adjust or clear filters

---

### Story 2.3: Season Detail View

As a user,
I want to view detailed season information,
So that I can evaluate whether to join.

**Acceptance Criteria:**

**Given** I am browsing the season library
**When** I tap on a season card
**Then** I navigate to the season detail page
**And** I see the full book information (title, author, cover image)

**Given** I am on the season detail page
**When** the page loads
**Then** I see the season description, schedule, location, and member count

**Given** I am on the season detail page
**When** I scroll down
**Then** I see upcoming meetups with dates and times

**Given** I am on the season detail page
**When** I view the schedule
**Then** I see all meetup dates and times for the season

**Given** I am on the season detail page
**When** I view the location
**Then** I see the venue name and a link (URL) to the location

---

### Story 2.4: View User Profiles

As a user,
I want to view season creator and member profiles,
So that I can learn more about the community before joining.

**Acceptance Criteria:**

**Given** I am on the season detail page
**When** I view the creator information
**Then** I see the creator's name, profile photo, and bio

**Given** I am on the season detail page
**When** I scroll to the members section
**Then** I see a list of current members
**And** each member shows their name and profile photo

**Given** I am on the season detail page
**When** I tap on a member's name or avatar
**Then** I see their public profile (name, photo, bio, favorite genres)

**Given** I am on the season detail page
**When** I tap on the creator's profile
**Then** I see their full profile information

---

### Story 2.5: Join a Season

As a user,
I want to join a season,
So that I can participate in meetups and become part of the community.

**Acceptance Criteria:**

**Given** I am on the season detail page
**When** I am NOT logged in and tap "Join Season"
**Then** I am prompted to log in or create an account
**And** after authentication, I return to the season

**Given** I am on the season detail page
**When** I am logged in and tap "Join Season"
**Then** I am added to the season as a member
**And** I see a success confirmation message
**And** I can now RSVP to upcoming meetups

**Given** I am on the season detail page
**When** I am already a member of that season
**Then** I see "Joined" instead of "Join Season"
**And** the button is disabled

**Given** I am on the season detail page
**When** the season is at maximum capacity
**Then** I see "Season Full" instead of "Join Season"
**And** the button is disabled

**Given** I am a member of a season
**When** I navigate to the season detail page
**Then** I see options to RSVP to upcoming meetups

---

## Epic 3: Season Creation & Management

Season creators can set up and publish new seasons with complete book, schedule, and location information.

### Story 3.1: Create New Season

As a logged-in user,
I want to create a new season with title, book, and description,
So that I can start a new book club.

**Acceptance Criteria:**

**Given** I am logged in and navigate to "Create Season"
**When** I enter a season title
**Then** the title is validated and accepted

**Given** I am on the create season page
**When** I enter the book title and author
**Then** the book information is captured

**Given** I am on the create season page
**When** I add a book cover image
**Then** the image is uploaded and displayed

**Given** I am on the create season page
**When** I enter a season description
**Then** the description is captured for the season detail page

**Given** I am on the create season page
**When** I try to proceed without required fields
**Then** I see validation errors
**And** I cannot proceed until requirements are met

---

### Story 3.2: Set Season Schedule

As a season creator,
I want to set the season duration and meetup schedule,
So that members know when meetups will occur.

**Acceptance Criteria:**

**Given** I am in the schedule step of season creation
**When** I set the season start date
**Then** the start date is validated (must be in the future)

**Given** I am in the schedule step
**When** I set the season duration (e.g., 10 weeks)
**Then** the end date is calculated automatically

**Given** I am in the schedule step
**When** I set the meetup frequency (e.g., bi-weekly)
**Then** all meetup dates are generated automatically

**Given** I am in the schedule step
**When** I set individual meetup dates and times
**Then** the schedule is saved with those specific dates

**Given** I am in the schedule step
**When** I review the generated schedule
**Then** I can edit individual meetup dates if needed

---

### Story 3.3: Configure Season Settings

As a season creator,
I want to configure season settings like max members and theme,
So that I can customize the season experience.

**Acceptance Criteria:**

**Given** I am in the settings step of season creation
**When** I set the maximum number of members
**Then** the limit is enforced when users try to join

**Given** I am in the settings step
**When** I select a theme for the season (e.g., "Summer Reads: Contemporary Relationships")
**Then** the theme is displayed on the season card

**Given** I am in the settings step
**When** I toggle the membership mode
**Then** I can choose auto-join or approval-required (MVP: auto-join only)

**Given** I am in the settings step
**When** I review my settings
**Then** I can go back to previous steps to make changes

---

### Story 3.4: Add Season Location

As a season creator,
I want to add a location URL/link for meetup venues,
So that members know where meetups will take place.

**Acceptance Criteria:**

**Given** I am in the location step of season creation
**When** I enter a location name (e.g., "Bean & Leaf Cafe")
**Then** the location name is saved

**Given** I am in the location step
**When** I paste a URL/link to the venue
**Then** the link is saved and displayed on the season detail page

**Given** I am in the location step
**When** I indicate the meetup is virtual
**Then** the season is marked as virtual with meeting link

**Given** I am in the location step
**When** I indicate the meetup is in-person
**Then** I can enter a physical location with address

---

### Story 3.5: Publish Season

As a season creator,
I want to publish my season to make it publicly discoverable,
So that other users can find and join my book club.

**Acceptance Criteria:**

**Given** I have completed all required season fields
**When** I click "Create Season" or "Publish"
**Then** the season is created and published
**And** I see a success confirmation

**Given** I have created a season
**When** I view my season dashboard
**Then** I see the season listed as "Active" or "Published"

**Given** I have created a season
**When** I share the season link
**Then** other users can view and join the season

**Given** I have created a season
**When** I navigate to the season detail page
**Then** I see management options (edit, close, view RSVPs)

---

### Story 3.6: Close Season

As a season creator,
I want to close my season to new members,
So that I can finalize the community.

**Acceptance Criteria:**

**Given** I am the creator of a published season
**When** I click "Close to New Members"
**Then** the season is marked as closed
**And** new users cannot join

**Given** I have closed a season
**When** users view the season detail page
**Then** they see "Season Closed" instead of "Join Season"

**Given** I have closed a season
**When** I change my mind
**Then** I can reopen the season to accept new members

**Given** I have closed a season
**When** I view the season management dashboard
**Then** I see the status as "Closed"

---

## Epic 4: RSVP & Commitment Tracking

Users can commit to attending specific meetups and track their attendance history; creators can monitor RSVPs.

### Story 4.1: RSVP to Meetup

As a season member,
I want to RSVP to attend a specific meetup,
So that I can commit to attending and receive reminders.

**Acceptance Criteria:**

**Given** I am on the season detail page or meetup list
**When** I am logged in and a member of the season
**Then** I see RSVP options for upcoming meetups

**Given** I am viewing upcoming meetups
**When** I tap "RSVP" on a meetup
**Then** my RSVP is recorded
**And** I see a success confirmation message

**Given** I have RSVP'd to a meetup
**When** I view the meetup details
**Then** my RSVP status shows "Going"

**Given** I have RSVP'd to a meetup
**When** the meetup date approaches
**Then** I receive push notification reminders

**Given** I am on the season detail page
**When** I complete an RSVP in 3 taps or fewer
**Then** the process feels frictionless and quick

**Given** I am not logged in
**When** I try to RSVP
**Then** I am prompted to log in first

---

### Story 4.2: Cancel RSVP

As a season member,
I want to cancel my RSVP to a meetup,
So that I can change my plans if needed.

**Acceptance Criteria:**

**Given** I have RSVP'd to a meetup
**When** I tap "Cancel RSVP"
**Then** my RSVP is removed
**And** I see a confirmation that my RSVP is cancelled

**Given** I have cancelled my RSVP
**When** I view the meetup details
**Then** my status shows "Not Going" or no RSVP

**Given** I have cancelled my RSVP
**When** I change my mind
**Then** I can RSVP again to the same meetup

**Given** I have cancelled my RSVP
**When** the meetup is approaching
**Then** I do NOT receive reminder notifications for that meetup

---

### Story 4.3: View RSVP History

As a logged-in user,
I want to view my RSVP history,
So that I can track my attendance and participation.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to my profile or RSVP history page
**Then** I see a list of all my RSVPs

**Given** I am viewing my RSVP history
**When** I scroll through the list
**Then** I see past meetups with dates and attendance status

**Given** I am viewing my RSVP history
**When** I filter by season
**Then** I see RSVPs for a specific season

**Given** I am viewing my RSVP history
**When** I filter by status (Going, Attended, Cancelled)
**Then** I see RSVPs matching that status

**Given** I am viewing my RSVP history
**Then** I can see statistics like total RSVPs and attendance rate

---

### Story 4.4: Creator RSVP Dashboard

As a season creator,
I want to view RSVP counts for each meetup,
So that I can track participation and plan accordingly.

**Acceptance Criteria:**

**Given** I am the creator of a season
**When** I navigate to the season management dashboard
**Then** I see RSVP counts for each meetup

**Given** I am on the creator dashboard
**When** I view the meetup list
**Then** each meetup shows: total RSVPs, going count, maybe count

**Given** I am on the creator dashboard
**When** I tap on a specific meetup
**Then** I see a detailed list of members who RSVP'd

**Given** I am on the creator dashboard
**When** RSVP counts update in real-time
**Then** the counts reflect the latest RSVPs without refreshing

**Given** I am on the creator dashboard
**When** I view past meetups
**Then** I can see actual attendance vs. RSVP (post-meetup)

---

## Epic 5: Seeds Facilitation

Users can access structured discussion prompts and formats to guide meaningful conversations during meetups.

### Story 5.1: View Available Seeds

As a logged-in user,
I want to view available Seeds for meetups,
So that I can choose prompts and formats for discussions.

**Acceptance Criteria:**

**Given** I am on the Seeds section or meetup view
**When** I navigate to available Seeds
**Then** I see a list of Seeds organized by format

**Given** I am viewing Seeds
**When** I expand a Seed
**Then** I see the full prompt text and format description

**Given** I am viewing Seeds
**When** I filter by category (Icebreaker, Character, Theme, Personal Connection)
**Then** I see only Seeds in that category

**Given** I am viewing Seeds
**When** I view Seed details
**Then** I see discussion tips to help facilitate

**Given** I am viewing Seeds
**When** there are no Seeds available
**Then** I see a message explaining Seeds will be available soon

---

### Story 5.2: Select Seed for Meetup

As a logged-in user preparing for a meetup,
I want to select a Seed to prepare,
So that I can review the format and prompts before the meetup.

**Acceptance Criteria:**

**Given** I am preparing for a meetup
**When** I select a Seed (format + prompts)
**Then** the Seed is saved/prepared for that meetup

**Given** I have selected a Seed
**When** I view my prepared Seeds
**Then** I see the selected format and prompts

**Given** I have selected a Seed
**When** I change my mind
**Then** I can select a different Seed

**Given** I am preparing for a meetup
**When** I review the prompts
**Then** I can see all prompts in the selected format

**Given** I am preparing for a meetup
**When** I want to unprepare
**Then** I can clear my selected Seed

---

### Story 5.3: Access Seeds During Meetup

As a logged-in member at a meetup,
I want to access Seeds during the meetup,
So that I can facilitate meaningful discussions.

**Acceptance Criteria:**

**Given** I am at a meetup
**When** I tap "Seeds" from the meetup view
**Then** the Seeds panel opens within 3 seconds

**Given** the Seeds panel is open
**When** I scroll through prompts
**Then** I can read each prompt aloud to the group

**Given** I am using a Seed during meetup
**When** I complete one prompt and want the next
**Then** I can navigate to the next prompt easily

**Given** I am using a Seed during meetup
**When** the discussion naturally moves on
**Then** I can end the Seed session

**Given** I am facilitating with Seeds
**When** I need to go back to a previous prompt
**Then** I can navigate backwards through prompts

**Given** I am logged in during a meetup
**When** I access Seeds
**Then** the experience is one-tap access from the meetup view

---

### Story 5.4: Chill Chat Mode

As a logged-in member at a meetup,
I want to choose "Chill Chat" mode for informal discussion,
So that we can have a natural conversation without structured prompts.

**Acceptance Criteria:**

**Given** I am on the meetup Seeds panel
**When** I select "Chill Chat" mode
**Then** the Seeds panel closes
**And** I can engage in informal discussion

**Given** I am in Chill Chat mode
**When** I change my mind
**Then** I can return to Seeds at any time

**Given** I am facilitating a meetup
**When** I choose Chill Chat
**Then** no prompts are displayed
**And** the conversation flows naturally

**Given** I am in Chill Chat mode
**When** the meetup ends
**Then** no Seed usage is recorded

---

## Epic 6: Notifications & Reminders

Users receive timely notifications for upcoming meetups and RSVP confirmations, with control over preferences.

### Story 6.1: Meetup Reminders

As a season member with an upcoming meetup,
I want to receive push notifications for upcoming meetup reminders,
So that I don't forget to attend.

**Acceptance Criteria:**

**Given** I have RSVP'd to a meetup
**When** the meetup is approaching (e.g., day before, hour before)
**Then** I receive a push notification reminder

**Given** I receive a meetup reminder
**When** I tap the notification
**Then** I am taken to the meetup or season detail page

**Given** I have RSVP'd to multiple meetups
**When** multiple reminders are due
**Then** I receive individual notifications for each

**Given** I have opted out of meetup reminders
**When** a meetup approaches
**Then** I do NOT receive reminder notifications

**Given** I am receiving a meetup reminder
**When** the notification displays
**Then** the message uses warm, inviting language ("We'd love to see you!")

---

### Story 6.2: RSVP Confirmations

As a season member,
I want to receive push notifications for RSVP confirmations,
So that I know my attendance is confirmed.

**Acceptance Criteria:**

**Given** I RSVP to a meetup
**When** my RSVP is recorded
**Then** I receive a push notification confirming my RSVP

**Given** I receive an RSVP confirmation
**When** I tap the notification
**Then** I am taken to the meetup details

**Given** I cancel my RSVP
**When** the cancellation is recorded
**Then** I receive a notification confirming the cancellation

**Given** I have opted out of RSVP confirmations
**When** I RSVP to a meetup
**Then** I do NOT receive a push notification

---

### Story 6.3: Notification Preferences

As a logged-in user,
I want to manage my notification preferences,
So that I can control which notifications I receive.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to settings
**Then** I see notification preference options

**Given** I am on notification preferences
**When** I toggle "Meetup Reminders"
**Then** I can enable or disable meetup reminder notifications

**Given** I am on notification preferences
**When** I toggle "RSVP Confirmations"
**Then** I can enable or disable RSVP confirmation notifications

**Given** I am on notification preferences
**When** I toggle "Season Activity"
**Then** I can enable or disable notifications for new members, schedule changes

**Given** I am on notification preferences
**When** I save my preferences
**Then** my settings are saved and applied immediately

**Given** I have saved my notification preferences
**When** I return to the settings page
**Then** my preferences reflect my saved choices

---

## Epic 7: Real-Time Engagement

Users receive live updates about RSVPs and season activity, creating a dynamic, responsive experience.

### Story 7.1: Real-Time RSVP Updates

As a season member,
I want to receive real-time updates when RSVPs are confirmed,
So that I can see who is attending in real-time.

**Acceptance Criteria:**

**Given** I am viewing a season or meetup
**When** another member RSVPs
**Then** I see the update within 10 seconds
**And** I don't need to refresh the page

**Given** I am on the season detail page
**When** I view the members list
**Then** I see new members appear in real-time as they join

**Given** I am on the meetup view
**When** a member RSVPs
**Then** the RSVP count updates immediately

**Given** I have a WebSocket connection
**When** there is a new RSVP
**Then** I receive a WebSocket message with the update

**Given** I have a WebSocket connection
**When** my connection is lost
**Then** the app gracefully falls back to polling
**And** reconnects when possible

---

### Story 7.2: Real-Time Season Activity

As a season member,
I want to receive real-time updates for season activity,
So that I stay informed about changes.

**Acceptance Criteria:**

**Given** I am a member of a season
**When** a new member joins the season
**Then** I see the update in real-time

**Given** I am a member of a season
**When** the creator updates the schedule
**Then** I see the schedule update in real-time

**Given** I am a member of a season
**When** the creator adds a new meetup
**Then** I see the new meetup appear in real-time

**Given** I am a member of a season
**When** the season is closed by the creator
**Then** I see the status update to "Closed"

**Given** I am viewing season activity
**When** multiple activities occur rapidly
**Then** the updates are batched or shown in sequence

---

### Story 7.3: Real-Time RSVP Counts

As a user viewing a meetup,
I want to see RSVP counts update in real-time across all viewers,
So that everyone sees the same current state.

**Acceptance Criteria:**

**Given** I am viewing a meetup
**When** any user RSVPs
**Then** the RSVP count updates for ALL users viewing

**Given** I am viewing a meetup
**When** any user cancels their RSVP
**Then** the count updates for all viewers

**Given** I am viewing the creator dashboard
**When** RSVPs come in
**Then** I see real-time count updates

**Given** multiple users are viewing the same meetup
**When** a user takes an action
**Then** all users see consistent data

**Given** real-time updates are in progress
**When** I navigate away and come back
**Then** I see the current state with no data loss
