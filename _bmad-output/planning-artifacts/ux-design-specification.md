---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-beansprout-2026-03-08.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "resources/DESIGN.md"
workflowStatus: complete
completionDate: 2026-03-22
  - "resources/DESIGN.md"
---

# UX Design Specification beansprout

**Author:** Loongluangkhot
**Date:** 2026-03-22

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

beansprout is a **mobile-first, connection-first app** where books are the vehicle for meaningful human connection. The core differentiator is **"Facilitation as Inclusion"** — structured meetup tools (Seeds) that:

1. **Elevate All Participants** — Trigger deeper, more meaningful conversations for ALL members, not just shy participants
2. **Remove Conversation Burden** — Eliminate the pressure on hosts/members to think of thoughtful questions themselves
3. **Create Premium Experience** — Make book club discussions feel sophisticated and valuable, not remedial

The Seeds (prompts + formats) are the **premium conversation experience** that elevates the entire group dynamic — even confident talkers benefit from structured prompts that help them go beyond surface-level discussion.

### Target Users

**Primary:** Young working adult casual readers (22-35)
- Full-time professionals with limited social time
- Seeks meaningful connections but values convenience
- Reads for escape, growth, and personal development
- Values authenticity and depth in relationships
- Often has social anxiety about attending meetups

**Key Personas:**
| Persona | Role | UX Needs |
|---------|------|----------|
| **Sarah (Hesitant Reader)** | Season Member | Feels included in discussions; non-intimidating entry points |
| **Marcus (Organizer)** | Season Creator | Reduces logistical chaos; feels in control |
| **Priya (Facilitator)** | Meetup Host | Feels like a skilled facilitator; confidence through structure |

### Key Design Challenges

1. **Dual-Audience Design** — Tools must feel premium and sophisticated, not "beginner-friendly" (avoid stigmatizing language)
2. **Onboarding Friction** — Users need to understand the "facilitation-first" value proposition before they experience it
3. **Anxiety Reduction** — First-time meetup anxiety is the #1 barrier; UX must feel warm, safe, and non-intimidating
4. **Context-Responsive Seeds** — Prompts should feel relevant to the book/season, not generic icebreakers
5. **Mobile-First Context** — Users will set up RSVPs and check Seeds during meetups; quick access is critical

### Design Opportunities

1. **Conversation Depth Indicators** — Visual cues showing "this prompt leads to deeper discussion"
2. **Warm, Inviting Tone** — Visual language that says "this is a safe space for connection"
3. **Progressive Disclosure** — Don't overwhelm new users with all prompts; show what's relevant at each moment
4. **Expertise Signaling** — UI that communicates "this is a proven method for meaningful discussion"
5. **Season/Book Personalization** — Seeds that feel tailored to the specific reading experience

## Core User Experience

### Defining Experience

The primary user loop for beansprout is:

> **Join Season → RSVP to Meetups → Attend & Use Seeds → Feel Connection → Join Another Season**

This "reading journey" creates a season-based commitment that users look forward to completing.

### Platform Strategy

- **Primary Platform:** Mobile-first PWA (touch-based)
- **Offline Support:** Not required for MVP
- **Camera:** Profile photo capture
- **Push Notifications:** Meetup reminders, RSVP confirmations, season activity
- **Future:** Location services for distance-based season filtering

### Effortless Interactions

1. **Quick RSVP** — Complete RSVP in 3 taps or fewer
2. **One-Tap Seeds Access** — During meetups, access prompts with minimal friction
3. **Automatic Reminders** — Notifications that feel helpful, not intrusive
4. **One-Handed Use** — Core actions operable with one thumb

### Critical Success Moments

| Moment | UX Requirement |
|--------|-----------------|
| **First Meetup with Seeds** | The make-or-break experience — must feel natural and valuable |
| **Completing First Season** | Celebration and clear path to join/create next season |
| **First Meaningful Discussion** | Seeds prompt connects user to others deeply |

### Experience Principles

1. **Seamless Commitment** — RSVP and attendance should feel frictionless; commitment is hard enough without app friction
2. **Meetup-Ready at All Times** — Seeds accessible instantly when users need them
3. **Reminder as Care, Not Spam** — Notifications communicate "we want you there"
4. **Mobile-Native Feel** — Interactions designed for thumbs, not cursors

## Desired Emotional Response

### Primary Emotional Goals

**Primary Emotional Goal:** Users should feel **"I found my kind of people"** — a sense of belonging and finding their tribe through shared reading experiences.

**Seeds Dual Emotional Experience:**

| Role | Desired Feeling |
|------|-----------------|
| **Host/Facilitator** | "I'm a better host than I thought" — confidence through structure |
| **All Participants** | "This is a safe space for real talk" — introspective, cozy atmosphere for personal stories, dreams, and opinions |

### Emotional Journey Mapping

| Stage | Emotional Goal |
|-------|----------------|
| **Discovery** | "I found people like me" — excitement and hope |
| **Joining a Season** | "I belong here" — safety and anticipation |
| **RSVP & Reminders** | "They care that I'm here" — being valued, not nagged |
| **During Meetup (Seeds)** | "This is where I can share the real me" — introspective, cozy, safe |
| **After Meetup** | "I said something real tonight" — accomplishment and connection |
| **Completing Season** | "I'm part of something" — belonging and pride |
| **Returning User** | "I missed this" — anticipation and loyalty |

### Micro-Emotions

| Positive (Target) | Negative (Avoid) |
|-------------------|-------------------|
| Belonging | Lonely |
| Confidence | Overwhelmed |
| Excitement | Awkward |
| Calm | Judged |
| Authenticity | Rushed |
| Safety | Anxious |

### Design Implications

| Emotion | UX Design Approach |
|---------|-------------------|
| Belonging | Warm imagery, relatable copy, community language |
| Confidence | Clear navigation, guided flows, success feedback |
| Introspective/Cozy | Soft colors, comfortable spacing, gentle animations |
| Safety | Non-judgmental language, inclusive design, privacy controls |
| Calm | Minimal cognitive load, no clutter, peaceful layouts |

### Emotional Design Principles

1. **Warmth Over Efficiency** — Optimize for feeling welcomed, not just task completion
2. **Safe Space Framing** — Every interaction reinforces "this is a judgment-free zone"
3. **Introspective Pacing** — Allow time and space for reflection, never rushed
4. **Celebration of Authenticity** — Honor real sharing, not just "good" contributions
5. **Reminder as Care** — Notifications communicate "we want you here"

## UX Pattern Analysis & Inspiration

### Inspiring Products

| App | Key Takeaways for beansprout |
|-----|------------------------------|
| **MeetUp** | Intent-based discovery, temporal filtering ("events this week"), frictionless RSVP, clear location/timing, emotional outcome of "finding like-minded people" |
| **Headspace** | Warm, introspective UI design, soft colors and calming layouts, non-judgmental guided experiences, structure that invites without pressuring |
| **Strava** | Commitment tracking and accountability, milestone celebration (badges, streaks), social accountability (community shows up for each other), activity feed showing progress |

### Transferable UX Patterns

| Pattern | Source | beansprout Application |
|---------|--------|------------------------|
| **Temporal Discovery** | MeetUp | "Show me meetups happening this week" — time-relevant season browsing |
| **Frictionless Commitment** | MeetUp | 3-tap-or-less RSVP — making commitment effortless |
| **Clear Decision Details** | MeetUp | Season cards showing date, time, location, member count at a glance |
| **Warm, Safe Atmosphere** | Headspace | Soft colors, cozy UI, inviting copy that says "this is a judgment-free space" |
| **Guided Structure** | Headspace | Seeds as "guided conversation" — prompts that invite sharing without pressure |
| **Non-Judgmental Tone** | Headspace | Language that celebrates authenticity, not "correct" contributions |
| **Milestone Celebration** | Strava | Season completion badges, attendance streaks, celebration of showing up |
| **Social Accountability** | Strava | Group members counting on each other, tracking attendance as care |
| **Progress Visualization** | Strava | Activity/progress showing "your season journey" |

### Anti-Patterns to Avoid

| Anti-Pattern | Why Avoid | beansprout Alternative |
|--------------|-----------|------------------------|
| Event Overload | Decision paralysis from too many options | Quality over quantity — curated seasons |
| One-Way Commitment | RSVP without accountability for showing up | Track actual attendance, celebrate commitment |
| Surface Connections | Connect once, fade away | Season model builds deeper relationships over time |
| Hollow Gamification | Points/badges feel meaningless when not tied to meaning | MVP: Simple milestone tracking. Future: Social gifting system where badges are meaningful peer recognition |
| Pressure/Pushing | Over-encourage or push introspective sharing | Invitation, never pressure — safe to pass |

### Gamification Roadmap

| Phase | Feature | Description |
|-------|---------|-------------|
| **MVP** | Basic Milestones | Season completion, attendance streaks — lightweight celebration |
| **Phase 2+** | Social Gifting | Points earned → badges to gift friends — peer support, social connectedness |

### Design Inspiration Strategy

**What to Adopt:**
- **Strava's Milestone System** — Season completion badges, attendance streaks, celebration of showing up
- **Headspace's Tone** — Warm, non-judgmental, introspective atmosphere
- **MeetUp's Discovery UX** — Time-based filtering, clear information hierarchy, easy RSVP

**What to Adapt:**
- **Strava's Accountability** — Modify for group-based accountability (not individual), less competitive
- **Headspace's Guided Experience** — Adapt from meditation to conversation facilitation
- **MeetUp's Commitment Model** — Modify one-off events to season-based recurring commitment

**What to Avoid:**
- **Harsh gamification** — Don't make missing meetups feel punishing
- **Overwhelming notifications** — Reminder as care, not nagging
- **Transactional UX** — Every interaction should feel personal and warm

## Design System Foundation

### Design System Choice

**Selected: Tailwind CSS + shadcn/ui**

### Rationale

| Factor | Alignment |
|--------|-----------|
| Speed | shadcn/ui provides ready-to-customize components for fast MVP |
| Mobile-First | Tailwind's responsive utilities built for mobile design |
| Warm Aesthetic | Custom palette enables cozy, introspective UI |
| Solo Developer | Copy/paste components, full control without library overhead |
| React/Next.js | Native compatibility with tech stack |
| Accessibility | shadcn/ui uses Radix primitives with built-in a11y |

### Implementation Approach

1. Install Tailwind CSS + configure custom warm color palette
2. Use shadcn/ui as component foundation
3. Customize components for warm, cozy brand feel
4. Define design tokens in Tailwind config

### Customization Strategy

| Element | Customization |
|---------|---------------|
| **Colors** | Warm tones — soft greens, warm neutrals, gentle accents |
| **Typography** | Friendly, readable sans-serif |
| **Spacing** | Generous whitespace for calm feel |
| **Components** | Warmer styling, less clinical |

## Defining Core Experience

### Defining Experience

**Core Interaction:**
> "Facilitate a meaningful conversation without the burden of figuring out what to ask"

Or phrased another way:
> "Lead a discussion that goes deeper than surface level"

This is the **Seeds experience** — the defining interaction that makes beansprout special. While RSVP and season discovery use familiar patterns, the facilitation tools are the novel, differentiating feature.

### User Mental Model

**How users think about hosting discussions:**
- Worry: "What if conversation dies?"
- Worry: "What if I'm not interesting enough?"
- Worry: "What if nobody participates?"
- Desire: Want to be a good host without extensive preparation

**Where users get confused with existing solutions:**
- Generic icebreakers feel forced
- Goodreads discussions are async, not real-time
- Meetup.com focuses on logistics, not conversation quality

**Mental Model:**
- Hosts want to be facilitators, not entertainers
- They want guidance, not a script
- They want confidence, not pressure

### Success Criteria

| Criteria | Description |
|----------|-------------|
| **Confidence** | User feels like a skilled facilitator, not an amateur |
| **Flow** | Conversation naturally deepens without forcing |
| **Inclusion** | All personality types can participate |
| **Depth** | Discussion goes beyond surface-level book talk |
| **Warmth** | Atmosphere feels cozy, not clinical |

**Performance Expectations:**
- Seeds accessible in under 3 seconds during meetups
- Prompts feel like inspiration, not homework
- Navigation is intuitive, not distracting

### Novel vs. Established Patterns

| Experience | Pattern Type | Implication |
|-----------|--------------|-------------|
| RSVP/Commitment | Established | Use MeetUp-like patterns users already know |
| Season Discovery | Established | Familiar browse/search patterns |
| Seeds/Facilitation | **Novel** | Needs user education but with familiar metaphors |

**For Seeds (Novel Pattern):**
- Use familiar "guided" metaphor (like Headspace's guided meditation)
- Frame as "conversation companion" not "hosting tool"
- Show, don't tell — let first experience speak for itself

### Experience Mechanics

**The Core Flow: Using Seeds During a Meetup**

| Phase | User Action | System Response |
|-------|-------------|-----------------|
| **1. Initiation** | Tap "Seeds" or swipe to meetup | Opens Seeds panel with current format |
| **2. Browse** | Scroll through prompts | Visual depth indicators, preview text |
| **3. Select** | Tap a prompt | Expands to full prompt + discussion tips |
| **4. Share** | Read aloud or share screen | Prompt displayed prominently |
| **5. Facilitate** | Move through prompts | Easy navigation, time cues optional |
| **6. Complete** | Wrap up | Celebration, gratitude prompt |

## Visual Design Foundation

### Creative North Star

**"The Digital Conservatory"** — A curated environment that breathes, inspired by botanical gardens and private libraries. The system employs **Editorial Sanctuary** philosophy with **Intentional Asymmetry** — content "grows" into white space, not centered grid layouts.

### Color System

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#4e6240` | Deep chlorophyll (forest leaf green) — core brand moments |
| **Surface** | `#faf9f5` | Warm book-bond white — reduces eye strain, paper-like |
| **Tertiary** | `#8b4c00` | Terracotta — growth moments (progress bars, notifications) |
| **On-surface** | `#1b1c1a` | Soft black — NOT pure black for premium feel |
| **Error** | `#ba1a1a` | Wrapped in error-container with high transparency |

**Key Rules:**
- No harsh blacks or whites — earthy, botanical palette
- No 1px solid borders — use background color shifts instead
- Glassmorphism for floating elements (nav bars, overlays) — `surface` at 70-80% opacity, 20px backdrop-blur
- Main CTAs: Linear gradient from `primary` → `primary-container` at 145° angle

### Typography System

| Role | Font | Usage |
|------|------|-------|
| **Display & Headlines** | Newsreader (serif) | Literary voice — authoritative yet nurturing |
| **Body & UI** | Manrope (sans-serif) | Functional clarity |

**Hierarchy Rule:** Maintain significant scale jump between headlines and body text (e.g., `headline-lg` 2rem → `body-md` 0.875rem)

### Elevation & Depth

**No drop shadows** — Use tonal layering:

| Layer | Token | Usage |
|-------|-------|-------|
| Base | `surface` | `#faf9f5` — main background |
| Section | `surface-container-low` | Elevated sections |
| Card | `surface-container-lowest` | Card surfaces |

**Floating Elements:** Tinted shadow — `on-surface` at 10% opacity, 24px blur, 8px Y-offset

### Component Styling

| Component | Style |
|-----------|-------|
| **Cards** | `roundedness-lg` (1rem), scale 0.98 on tap, `spacing-6` (2rem) between items |
| **Primary Button** | Gradient fill (primary → primary-container), `roundedness-full`, Manrope bold |
| **Secondary Button** | No fill, "Ghost Border" (`outline-variant` 20% opacity) |
| **Tertiary Button** | Text only with organic leaf icon trailing |
| **Inputs** | Pill-shaped (`roundedness-full`), `surface-container-high` background |
| **Progress Bars** | Terracotta fill, `secondary-container` track |

### Design Principles

| Do ✅ | Don't ❌ |
|-------|---------|
| Asymmetrical margins for editorial feel | 100% black text |
| "Dead space" — 40% of screen should be surface | Standard Material icons |
| `roundedness-xl` for large imagery (book covers) | Harsh borders or dividers |
| Fine Line icons (1px stroke, rounded terminals) | Pure grey/black shadows |

### Accessibility Considerations

- Use `on-surface` (`#1b1c1a`) instead of pure black for softer contrast
- Ghost Border fallback at 15% opacity if boundary is strictly required for accessibility
- Error states wrapped in `error-container` with high transparency to keep mood calm

## Design Direction Decision

### Design Direction: The Digital Conservatory

**Chosen Direction:** Editorial Sanctuary with Botanical Primitives

Based on the established "Digital Conservatory" design system from `resources/DESIGN.md`, the design direction is a **curated environment that breathes** — inspired by botanical gardens and private libraries.

### Key Design Direction Elements

| Element | Approach |
|---------|----------|
| **Layout Philosophy** | Editorial Sanctuary with Intentional Asymmetry — content "grows" into white space |
| **Visual Weight** | Airy, spacious — 40% dead space (surface color) on every screen |
| **Density** | Low density, generous whitespace for introspective feel |
| **Imagery** | Soft, organic photography; `roundedness-xl` for book covers |
| **Navigation** | Glassmorphism floating nav bar, minimal bottom navigation |

### Screen-Specific Direction

| Screen | Design Direction |
|--------|-----------------|
| **Season Discovery** | Editorial layout with asymmetrical margins, large typography for themes |
| **Season Detail** | Magazine-style spread with book cover prominence |
| **Seeds Panel** | Calm, centered focus — one prompt at a time, cozy atmosphere |
| **RSVP Flow** | Minimal, frictionless — gradient CTA, clear progress |
| **Profile** | Warm, personal feel — bio-focused, community language |
| **Meetup View** | Quick access, low distraction — Seeds one tap away |

### Rationale

This design direction aligns with:
- **Emotional Goals:** Warm, safe, introspective atmosphere
- **Brand Identity:** Connection-first, sophisticated but approachable
- **Competitive Differentiation:** "Digital Conservatory" feel unlike MeetUp or Goodreads
- **Technical Feasibility:** Tailwind CSS + shadcn/ui can implement this direction

## User Journey Flows

### Critical Journeys

| Journey | Persona | Goal |
|---------|---------|------|
| **Season Discovery & Join** | Sarah (Member) | Find and join a season |
| **Season Creation** | Marcus (Creator) | Create and launch a season |
| **Seeds Facilitation** | Priya (Facilitator) | Lead a meaningful discussion during meetup |

### Journey 1: Season Discovery & Join (Sarah)

**Goal:** Find a season that matches interests and join it

```mermaid
flowchart TD
    A[📱 Open App] --> B[🏠 Home - Season Discovery]
    B --> C{Browse or Search?}
    C -->|Browse| D[Explore Season Library]
    C -->|Search| E[Search by keyword/theme]
    D --> F[Filter: This Week / Theme / Location]
    E --> G[Search Results]
    F --> H[Season Cards Grid]
    G --> H
    H --> I[Tap Season Card]
    I --> J[Season Detail View]
    J --> K{Interested?}
    K -->|No| L[Back to Discovery]
    K -->|Yes| M[Tap "Join Season"]
    M --> N[Confirmation + Welcome]
    N --> O[📅 View Upcoming Meetups]
    O --> P[RSVP to Next Meetup]
    P --> Q[✅ RSVP Confirmed + Reminder Set]
```

**Key Interaction Points:**
| Step | Action | UX Focus |
|------|--------|----------|
| Home | Browse/Search | Editorial layout, warm imagery |
| Season Cards | Preview | Asymmetrical margins, clear info |
| Season Detail | Evaluate | Magazine spread, book cover prominence |
| Join | Commit | Gradient CTA, welcoming copy |
| RSVP | Confirm | 3 taps or fewer, celebration moment |

### Journey 2: Season Creation (Marcus)

**Goal:** Create a new season with book, schedule, and settings

```mermaid
flowchart TD
    A[📱 Open App] --> B[👤 Profile/Tab Bar]
    B --> C[Tap "Create Season"]
    C --> D[📖 Step 1: Book Info]
    D --> E[Book Title, Author, Cover Image]
    E --> F[Tap "Next"]
    F --> G[📅 Step 2: Schedule]
    G --> H[Duration, Meetup Frequency, Start Date]
    H --> I[Tap "Next"]
    I --> J[📍 Step 3: Location]
    J --> K[Location Name/URL, Virtual/In-Person]
    K --> L[Tap "Next"]
    L --> M[⚙️ Step 4: Settings]
    M --> N[Max Members, Theme, Description]
    N --> O[Tap "Create"]
    O --> P[🎉 Season Created!]
    P --> Q[Share Season Link]
    Q --> R[View Season Dashboard]
```

**Key Interaction Points:**
| Step | Action | UX Focus |
|------|--------|----------|
| Step 1: Book | Enter info | Autocomplete, cover upload |
| Step 2: Schedule | Set timing | Calendar picker, recurring options |
| Step 3: Location | Add venue | URL paste for venue link |
| Step 4: Settings | Configure | Toggles, member limits |
| Create | Launch | Gradient CTA, celebration moment |

### Journey 3: Seeds Facilitation (Priya)

**Goal:** Any logged-in member can spontaneously start a Seeds session during the meetup to guide group discussion

```mermaid
flowchart TD
    A[📍 Attending Meetup]
    A --> B[☕ Real-Time Conversation]
    B --> C{Moment arises to deepen discussion?}
    C -->|No| B
    C -->|Yes| D["Someone says: 'Let me check what we have for this'"]
    D --> E[📱 Opens beansprout App]
    E --> F{Logged In?}
    F -->|No| G[🔐 Login Prompt]
    G --> H[Quick Login / Continue as Member]
    H --> I[Access Granted]
    F -->|Yes| I
    I --> J[Taps "Seeds" from Meetup View]
    J --> K[🪴 Seeds Panel Slides Up]
    K --> L[Quick Glance at Formats]
    L --> M{Choose Format?}
    M -->|Same Format| N[Use Last/Default Format]
    M -->|New Format| O[Select Different Format]
    N --> P[Browse Available Prompts]
    O --> P
    P --> Q[Tap Prompt to Expand]
    Q --> R[Full Prompt + Discussion Tips]
    R --> S[Read Aloud / Share Screen]
    S --> T[🗣️ Group Discussion Based on Prompt]
    T --> U{Continue or Wrap Up?}
    U -->|Continue| V[Tap Next Prompt]
    U -->|Wrap Up| W[Tap "End Session"]
    V --> P
    W --> X[🌱 Session Summary]
    X --> Y[Optional: Quick Reflection]
    Y --> Z[Done — Back to Natural Conversation]
```

**Key Design Considerations:**
| Aspect | Implementation |
|--------|-----------------|
| **Facilitator Assignment** | Happens organically during meetup — anyone can volunteer |
| **Preparation** | NOT required — Seeds are for on-the-fly facilitation |
| **Initiator** | Any attending logged-in member |
| **Session Duration** | Flexible — one prompt or many |
| **Access Control** | Only logged-in members can use Seeds |

**During Meetup UX Requirements:**
| Need | Solution |
|------|----------|
| **Quick Access** | Seeds button visible on Meetup View — one tap away |
| **Spontaneous Entry** | Login required, but no setup required |
| **Flexible Session** | Start with one prompt, extend as needed |
| **Non-Disruptive** | Panel slides up, doesn't force mode switch |
| **Return to Natural Flow** | Easy to end session and return to conversation |

### Common Journey Patterns

| Pattern | Implementation |
|---------|---------------|
| **Quick RSVP** | 3 taps or fewer from card to confirmed |
| **Seeds Access** | One tap from meetup view (logged-in members only) |
| **Format Selection** | Visual cards with depth indicators |
| **Error Recovery** | Clear messaging, easy retry |
| **Progress Indicators** | Celebration at completion |

### Flow Optimization Principles

| Principle | Application |
|-----------|-------------|
| **Minimizing Friction** | RSVP in 3 taps, Seeds one-tap away (logged in) |
| **Clear Feedback** | Every action gets confirmation |
| **Progress Visibility** | Users always know where they are |
| **Graceful Errors** | Friendly messaging, easy recovery |
| **Celebration Moments** | Completing journeys feels rewarding |

## Component Strategy

### Design System Foundation

**Selected:** Tailwind CSS + shadcn/ui

**Foundation Components Available:**
| Category | Components |
|----------|------------|
| **Actions** | Button, Toggle, Switch |
| **Display** | Card, Badge, Avatar, Progress |
| **Forms** | Input, Select, Checkbox, Radio |
| **Navigation** | Tabs, Sheet, Bottom Navigation |
| **Feedback** | Toast, Dialog, Tooltip, AlertDialog |
| **Layout** | Sheet, Separator, ScrollArea |

### Custom Components

| Component | Purpose | Key Feature |
|-----------|---------|-------------|
| **SeasonCard** | Display season preview | Book cover, title, theme, next meetup |
| **SeedsPanel** | Slide-up sheet for Seeds access | Quick entry during meetups |
| **PromptCard** | Display prompts with format labels | Category tags for organization |
| **FormatCard** | Display format options | Descriptions and visual indicators |
| **MeetupCard** | Display meetup with RSVP | Status, date, location, attendance |
| **GrowthBar** | Progress tracking | Terracotta fill, secondary-container track |

### PromptCard Specification

| Attribute | Value |
|-----------|-------|
| **Display** | Prompt text, format label, category tag |
| **States** | Default, expanded (full prompt + tips), used |
| **Tap Action** | Expands to show full prompt + discussion tips |
| **Visual** | Warm styling, roundedness-lg, no harsh borders |

**Format Labels:**
- Icebreaker
- Character
- Theme
- Personal Connection
- Writing & Craft
- Wrap-Up

### SeedsPanel Specification

| Attribute | Value |
|-----------|-------|
| **Entry** | Slide-up sheet from bottom |
| **Trigger** | Tap "Seeds" on Meetup View |
| **Access** | Logged-in members only |
| **Content** | Format selector + prompt list |
| **Exit** | Swipe down or tap outside |

### Component Implementation Roadmap

**Phase 1 — Core MVP:**
| Component | Priority | User Journey |
|-----------|----------|--------------|
| SeasonCard | High | Discovery & Join |
| SeedsPanel | Critical | Facilitation (defining experience) |
| PromptCard | Critical | Facilitation |
| FormatCard | High | Facilitation |
| GradientButton | High | All CTAs |

**Phase 2 — Supporting:**
| Component | Priority | User Journey |
|-----------|----------|--------------|
| MeetupCard | Medium | RSVP & Attendance |
| GrowthBar | Medium | Milestones |
| MemberAvatar | Medium | Community |

## UX Consistency Patterns

### Button Hierarchy

| Type | Style | Usage |
|------|-------|-------|
| **Primary** | Gradient fill (primary → primary-container), roundedness-full | Main CTAs: Join Season, RSVP, Create Season |
| **Secondary** | Ghost Border (outline-variant 20%), no fill | Cancel, Back, Secondary actions |
| **Tertiary** | Text only + organic leaf icon | Settings, Less important actions |

**Interaction:** Scale 0.98 on tap, never change color dramatically

### Feedback Patterns

| Feedback | Visual | Example |
|----------|--------|---------|
| **Success** | Toast with green tint, checkmark icon | "You're in! See you at the meetup" |
| **Error** | Toast with error-container background, calm messaging | "Oops, something went wrong. Try again?" |
| **Info** | Toast with surface-container, neutral icon | "Reminder set for tomorrow" |
| **Loading** | Skeleton shimmer, never spinner | Season cards loading |

### Navigation Patterns

| Context | Pattern |
|---------|---------|
| **Primary Nav** | Bottom tab bar with 4 items (Home, Seasons, Meetups, Profile) |
| **Secondary Nav** | Back arrows, breadcrumbs within screens |
| **Floating Nav** | Glassmorphism for Sheets and Overlays |

### Empty States

| State | Copy Example | Visual |
|-------|--------------|--------|
| **No Seasons** | "No seasons match your search. Try adjusting your filters or start your own!" | Illustration of seeds growing |
| **No Upcoming Meetups** | "No meetups scheduled. The group might be between chapters!" | Calm illustration |
| **No Seeds Used** | "No Seeds sessions yet. When the moment feels right, start a conversation!" | Encouraging prompt |

### Loading & Skeleton Patterns

| Context | Pattern |
|---------|---------|
| **Initial Load** | Full skeleton with warm shimmer |
| **Refresh** | Pull-to-refresh with gentle animation |
| **Action Loading** | Button shows loading state, stays in place |

### Form Validation

| State | Behavior |
|-------|----------|
| **Focus** | Ghost Border becomes 100% primary |
| **Error** | Gentle red tint in error-container, calm message below |
| **Success** | Subtle green tint, checkmark |
| **Disabled** | Reduced opacity, no interaction |

### Consistency Principles

| Principle | Implementation |
|-----------|----------------|
| **"No-Line" Rule** | Use background color shifts, never 1px borders |
| **Warm Feedback** | All messages use friendly, calm language |
| **Quick Recovery** | Errors always include "Try again" or recovery path |
| **Progress Celebration** | Milestones celebrated, not just completed |

## Responsive Design & Accessibility

### Responsive Strategy

| Device | Priority | Strategy |
|--------|----------|----------|
| **Mobile** | Primary | Touch-first, thumb-friendly, bottom navigation |
| **Tablet** | Secondary | Touch-optimized, slightly more density |
| **Desktop** | Tertiary | Expanded layouts, side navigation optional |

### Breakpoint Strategy

| Breakpoint | Width | Layout |
|------------|-------|--------|
| **Mobile** | < 768px | Single column, bottom nav, full-width cards |
| **Tablet** | 768px - 1023px | 2-column grids, maintained touch targets |
| **Desktop** | ≥ 1024px | Side-by-side layouts, expanded navigation |

### Mobile-First Approach

- Design for mobile first, then enhance for larger screens
- Critical content always visible on mobile
- Bottom navigation with 4 tabs: Home, Seasons, Meetups, Profile
- Seeds panel optimized for one-handed use

### Accessibility Strategy

**WCAG Compliance Target:** Level AA (Industry standard)

| Area | Requirement |
|------|-------------|
| **Color Contrast** | Minimum 4.5:1 for normal text, 3:1 for large text |
| **Touch Targets** | Minimum 44x44px for all interactive elements |
| **Focus Indicators** | Visible focus states for keyboard navigation |
| **Screen Readers** | Semantic HTML, proper ARIA labels |
| **Motion** | Respect reduced-motion preferences |

**Design Brief Alignment:**
- Use `on-surface` (`#1b1c1a`) for softer contrast
- Ghost Border fallback at 15% opacity if strictly needed
- Error states wrapped in `error-container` with transparency

### Testing Plan

| Type | Tools/Methods |
|------|---------------|
| **Automated** | axe-core, Lighthouse a11y audits |
| **Screen Readers** | VoiceOver (iOS), TalkBack (Android) |
| **Keyboard** | Full keyboard-only navigation testing |
| **Color Blindness** | Simulate deuteranopia, protanopia |
| **Real Devices** | Test on actual iOS and Android phones |

