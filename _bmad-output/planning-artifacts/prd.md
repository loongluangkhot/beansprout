---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-beansprout-2026-03-08.md"
  - "_bmad-output/research/research-phase-summary.md"
  - "_bmad-output/research/meetup-formats-v1.md"
  - "_bmad-output/research/retrospective-tools-for-bookclubs.md"
  - "_bmad-output/research/prompt-library-v1.md"
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-03-000000.md"
workflowType: 'prd'
classification:
  projectType: Mobile App
  domain: Social/Community (book clubs)
  complexity: Low-Medium
  projectContext: greenfield
---

# Product Requirements Document - beansprout

**Author:** Loongluangkhot
**Date:** 2026-03-17

## Executive Summary

beansprout is a **mobile-first, cross-platform app** that facilitates social book clubs for casual readers seeking meaningful human connections through reading. Unlike traditional book apps that focus on tracking reads or academic discussions, beansprout is a **connection-first platform** where books are the vehicle and meaningful human connection is the destination.

The app addresses a fundamental human need: finding people who share our values and meet emotional needs without requiring articulation — what we call **"emotional shorthand."** By combining accountability (helping users commit to reading) with emotional connection (satisfying the deeper need for understanding), beansprout creates a unique value proposition that distinguishes it from existing solutions.

### What Makes This Special

1. **Dual Motivation Engine** — Accountability and emotional connection reinforce each other: users commit to reading because they want to show up for their group, and they form connections because they share the experience of reading the same book.

2. **Facilitation as Inclusion** — The 28+ structured discussion prompts and 6 meetup formats lower the anxiety barrier for shy participants who typically don't speak up in traditional book clubs. Any member can facilitate using the app's tools.

3. **Season-Based Model** — Book clubs run in 3-4 month "seasons" with themes, creating gamified achievement cycles while maintaining low commitment barriers.

4. **Connection-First Philosophy** — This is not a book app; it's a connection app where books happen to be the medium for finding like-minded people.

## Success Criteria

### User Success

- **Season Completion:** Users complete a season by attending >=70% of scheduled meetups
- **Attendance Rate:** >=70% of RSVPs result in actual attendance (reduces no-shows)
- **Facilitation Usage:** >=60% of meetups use facilitation tools (prompts/formats)
- **Qualitative Indicators:** Users report meaningful discussions, sense of growth, and wellness benefits

### Business Success

Using engagement metrics as proxies (monetization to be defined post-MVP):

- **Retention:** >=30% of users who complete a season join another season
- **Season Creation Rate:** % of users who create their own season (organic growth)
- **App Engagement:** Session frequency and duration metrics to be tracked
- **User Growth:** Organic growth through word-of-mouth (quality connections over quantity)

### Measurable Outcomes

| Metric | MVP Target |
|--------|------------|
| Season Completion Rate | >=50% of users |
| Attendance Rate | >=70% of RSVPs |
| User Retention (re-join) | >=30% |
| Facilitation Usage | >=60% of meetups |

**Go/No-Go Decision Point:**
- If Season Completion Rate <30% after 3 months: Re-evaluate core value proposition
- If Attendance Rate <50%: Improve reminders and RSVP experience

## User Journeys

### Persona 1: The Hesitant Reader — Sarah (Season Member)

**Opening Scene:**
Sarah, 28, works in marketing. She loves reading but feels isolated — her friends aren't readers. She's tried Goodreads but it's lonely. She wants connection but dreads the awkwardness of meeting strangers and being forced to speak up in discussions.

**Rising Action:**
Sarah discovers beansprout through a friend. She downloads it, creates a profile highlighting her love of contemporary fiction. She browses the Season Library and finds "Summer Reads: Contemporary Relationships" — a perfect match. She RSVPs and receives reminders. The night before, she nervously checks the meetup details.

**Climax:**
At the café, Sarah is anxious. But the meetup uses a Round-Robin format with guided prompts. She doesn't have to compete for airtime. The Icebreaker prompt ("What's a book that changed how you see yourself?") gets her talking. By the Wrap-Up, she's shared something real and two members connected with her instantly.

**Resolution:**
Sarah leaves feeling *seen*. She RSVPs to the next meetup before leaving. For the first time, reading feels social, not solitary. She joins two more seasons that year and recommends beansprout to three friends.

### Persona 2: The Organizer — Marcus (Season Creator/Host)

**Opening Scene:**
Marcus, 32, has wanted to start a book club for years. He's tried Facebook Groups and Meetup.com but organizing is chaotic — who's bringing the book? Who's hosting? RSVPs don't match actual attendance. He wants to create something meaningful but the logistics drain him.

**Rising Action:**
Marcus finds beansprout and uses the Season Creation flow. He selects the "Book Club Starter Template," picks *Tomorrow, and Tomorrow, and Tomorrow*, sets a 10-week schedule with bi-weekly meetups, and adds location details. He shares the season link and members join. He gets RSVP confirmations and reminders are automated.

**Climax:**
First meetup: 8 RSVPs, 7 show up. No-shows are tracked. Marcus opens the facilitation tools, selects the "Guided Discussion" format, and uses prompts to structure the conversation. The meetup flows smoothly — no awkward silences, everyone participates.

**Resolution:**
Marcus finishes the season with 6 of 7 members attending 70%+ of meetups. He creates his second season. The template system turned his "chaotic Facebook Group" into a structured, rewarding experience. He tells friends: "It's like having a co-host who never forgets the agenda."

### Persona 3: The Enabler — Priya (Meetup Facilitator)

**Opening Scene:**
Priya, 30, joined beansprout as a Season Member. She's a natural connector but hates the pressure of "being the host." She loves the idea of helping discussions but worries: What if I pick the wrong topic? What if conversation dies? What if I'm not interesting enough?

**Rising Action:**
Before her second meetup, Priya opens the Facilitation Tools. She sees 28+ prompts organized by category (Icebreakers, Character, Theme, Personal Connection). She selects the "ORID Deep-Dive" format — a structured reflection method. The app shows her exactly what to ask and in what order.

**Climax:**
The meetup starts with an Objective prompt: "What happened in the book?" Members answer. Then Reflective: "How did that make you feel?" The conversation deepens. She uses a Personal Connection prompt: "Has anything like this happened to you?" A shy member who rarely speaks suddenly shares a powerful story. The room goes quiet. Real connection happens.

**Resolution:**
Priya facilitators three more meetups. She discovers she loves enabling meaningful moments. She starts a "Facilitator Tips" thread in the season chat. The structured prompts gave her confidence — she doesn't need to be an expert, just a good question-asker.

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---------|-------------------------|
| **Sarah (Member)** | Season discovery, easy RSVP, reminder system, Seed formats that include shy participants |
| **Marcus (Creator)** | Season templates, schedule management, RSVP tracking, automated reminders, Seed tools to share |
| **Priya (Facilitator)** | Prompt library (categorized), format templates (structured flows), confidence-building UX |

## Innovation & Novel Patterns

### Detected Innovation Areas

1. **Facilitation as Inclusion (Seed)**
   - Structured meetup tools (28+ prompts, 6 formats) designed specifically to include shy participants
   - The *product's core value proposition* is the facilitation, not the books or scheduling
   - **Novelty:** Goodreads, Meetup, and other book club platforms focus on logistics or async discussion. No major platform has made structured, inclusive facilitation the central feature.

2. **Author-Created Seeds (Future Vision)**
   - Authors can create custom prompts and formats for their books
   - Transforms the book itself into a facilitation guide
   - Creates unique, book-specific experiences that can't be replicated
   - **Novelty:** No existing platform enables authors to directly shape the discussion experience of their readers

### Market Context

- **Existing Solutions:** Goodreads (tracking + async discussion), Meetup.com (logistics + discovery), Facebook Groups (informal discussion)
- **Gap:** None of these platforms provide structured, inclusive facilitation tools that lower barriers for shy participants
- **Differentiation:** beansprout is the first "facilitation-first" book club platform

### Validation Approach

- **MVP:** Track Seed usage rate (target: >=60% of meetups use tools)
- **Success Metric:** Qualitative feedback on whether shy participants feel included
- **Future:** Author adoption rate and member satisfaction with author-created Seeds

### Risk Mitigation

- **Risk:** Users may prefer informal conversation over structured formats
- **Mitigation:** Make formats optional; users can choose "Chill Chat" mode
- **Risk:** Author-created Seeds require author buy-in
- **Mitigation:** Start with established authors/influencers; make Seed creation frictionless

## Technology Requirements

### Recommended Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React (Next.js for SSR/PWA) |
| **Backend** | FastAPI (Python) |
| **Database** | PostgreSQL |
| **Real-Time** | FastAPI WebSockets |
| **Auth** | JWT or OAuth2 |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) |

### Platform Requirements

- **Architecture:** Mobile-First Web App (PWA), Single Page Application (SPA)
- **Platform Support:** Chrome on iOS, Android, and Desktop
- **PWA Features:** Service workers (offline caching), App manifest (installable), Push notifications (Web Push API)
- **Device Access:** Camera (profile photos), Location (future feature)

### Performance Targets

- **First Contentful Paint:** <2 seconds on 4G
- **Time to Interactive:** <3 seconds
- **Lighthouse Score:** >=90 (mobile)

### Accessibility

- **Current:** Basic compliance (semantic HTML)
- **Enhancement:** Full WCAG 2.1 AA compliance in future release

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

- **Approach:** Experience MVP — The Seeds facilitation experience must feel polished and inclusive to deliver on the "facilitation as inclusion" promise
- **Resource Requirements:** Solo developer (React frontend + FastAPI backend)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Sarah (Member) can discover seasons, RSVP, and participate in facilitated meetups
- Marcus (Creator) can create seasons with schedule and share with members
- Priya (Facilitator) can prepare and lead discussions using Seeds

**Must-Have Capabilities:**
1. User Profiles
2. Season Library (browse/discover)
3. Season Creation (single template)
4. RSVP (commitment tracking)
5. Seeds (10 prompts, 3 formats)
6. Basic Location (URL/link paste)
7. Push Notification Reminders

**Deferred to Post-MVP:** Automatic attendance check-in (self-reported initially)

### Post-MVP Features

**Phase 2:**
- Expanded Seeds library (28+ prompts, 6 formats)
- Automatic attendance check-in
- Action memos
- Enhanced user profiles

**Phase 3:**
- Author-created Seeds
- Collaborative book proposals
- Media wall
- Virtual meetups
- Gamification (points, badges)
- Location discovery map
- Monetization

### Risk Mitigation Strategy

- **Technical Risks:** WebSocket real-time features are well-documented; start with simple polling if needed
- **Market Risks:** MVP tests core hypothesis — facilitation as inclusion; user feedback will validate
- **Resource Risks:** Reduced Seeds scope (10 prompts, 3 formats) allows faster MVP launch

## Functional Requirements

### 1. User Management

- **FR1:** Users can create an account with email and password
- **FR2:** Users can log in and log out of their account
- **FR3:** Users can view and edit their profile (bio, favorite genres, reading history)
- **FR4:** Users can upload a profile photo

### 2. Season Discovery

- **FR5:** Users can browse public seasons in a season library
- **FR6:** Users can search and filter seasons by theme, genre, or schedule
- **FR7:** Users can view detailed season information (book, schedule, member count, location)
- **FR8:** Users can view season creator and member profiles

### 3. Season Creation

- **FR9:** Season creators can create a new season with title, book, and description
- **FR10:** Season creators can set the season duration and meetup schedule
- **FR11:** Season creators can set a maximum number of members
- **FR12:** Season creators can add a location URL/link for meetup venues
- **FR13:** Season creators can publish a season to make it publicly discoverable
- **FR14:** Season creators can close a season to new members
- **FR15:** Season creators can choose membership approval mode (auto-join or approval required) *(Future feature)*

### 4. RSVP Management

- **FR16:** Users can join a season (auto-join in MVP)
- **FR17:** Users can RSVP to individual meetups
- **FR18:** Users can cancel their RSVP to a meetup
- **FR19:** Users can view their RSVP history
- **FR20:** Season creators can view RSVP counts for each meetup

### 5. Seeds (Facilitation)

- **FR21:** Users can view available Seeds for meetups
- **FR22:** Users can select a Seed to prepare for a meetup (includes format + prompts)
- **FR23:** Users can access the Seed's format and prompts during a meetup
- **FR24:** Users can choose "Chill Chat" mode (no Seed, informal discussion)

### 6. Notifications

- **FR25:** Users can receive push notifications for upcoming meetup reminders
- **FR26:** Users can receive push notifications for RSVP confirmations
- **FR27:** Users can opt out of specific notification types

### 7. Real-Time Updates

- **FR28:** Users receive real-time updates when RSVPs are confirmed
- **FR29:** Users receive real-time updates for season activity (new members, schedule changes)
- **FR30:** The system updates RSVP counts in real-time across all viewing users

## Non-Functional Requirements

### Performance

- **Response Time:** Pages load within 2 seconds on 4G connection
- **First Contentful Paint:** <2 seconds
- **Time to Interactive:** <3 seconds
- **Real-Time Updates:** RSVP and season activity updates appear within 10 seconds
- **Push Notifications:** Delivered within 30 seconds of trigger event

### Security

- **Authentication:** Secure login with password hashing (bcrypt)
- **Data Protection:** All user data stored securely, no sensitive data in logs
- **Session Management:** JWT-based authentication with secure token handling
- **HTTPS:** All communications encrypted in transit

### Scalability (Post-MVP)

- System supports 10x user growth without architecture changes
- Database and API designed for horizontal scaling
