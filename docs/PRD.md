# CommunityHub — Product Requirements Document (PRD)

## 1. Executive Summary

CommunityHub is a comprehensive management platform (Web/PWA) for a Synagogue or Community Center, built with **Next.js 16**, **Supabase (PostgreSQL)**, and **Tailwind CSS**. Primary language is Hebrew (RTL).

It serves three pillars:

| Pillar | Capabilities |
|--------|-------------|
| **Utility** | Dynamic prayer/lesson scheduling with Zmanim (Hebcal) integration, seasonal rules, and admin overrides. |
| **Community** | Household-based member directory, life events, Gmach board, Mazal Tov board, D'var Torah, announcements, and "Meet the Family" spotlight. |
| **Logistics & Finance** | Project-based financial tracking, High Holiday seat registration, and Purim Mishloach Manot management. |

---

## 2. Data Model

### 2.1 Household vs. User

The **Household** is the core entity for billing, registration, and family identity. The **User** is the account entity.

```
Household (family)
├── User A  (adult, manager)   ← can register seats, choose Purim package
├── User B  (adult, manager)   ← same authority as User A
└── User C  (child, member)    ← view-only
```

- `users.household_id` → FK to `households.id`. Each user belongs to one household.
- `household_managers` — many-to-many table defining which users can act on behalf of a household.
- Seasonal registrations (High Holidays, Purim) are keyed on `household_id`, not `user_id`. Either manager can submit/update; the registration belongs to the household.

### 2.2 Global Roles (The Gatekeeper)

| Role | Access |
|------|--------|
| **Guest** | Unauthenticated. Sees only the next upcoming prayer, sign-in/sign-up buttons, and public announcements. |
| **Pending** | Authenticated but not yet approved. Sees a "Waiting for Admin Approval" screen. Cannot access member areas. |
| **Member** | Full access to Directory, Gmach, Life Events, seasonal registration (if enabled), Meet the Family, and Contact Us. |
| **Admin** | Everything a Member can do, plus the Admin Control Tower (user approval, schedule management, finance, content management, system toggles). |

### 2.3 Authentication

- **NextAuth.js** with Credentials provider and JWT sessions.
- Registration creates an account with email + bcrypt-hashed password → user enters `PENDING` state.
- Admin approves via the User Queue → user promoted to `MEMBER` and assigned to a household.
- Middleware enforces role-based route protection. Server actions include defense-in-depth `requireAdmin()` checks.

### 2.4 Row Level Security (Supabase RLS)

Every table has RLS enabled. Key policies:

| Scope | Rule |
|-------|------|
| Public read | `locations`, `schedule_entries`, `schedule_overrides`, `hh_prayers`, `system_toggles`, `announcements`, `dvar_torah` |
| Member read | `users` (MEMBER/ADMIN rows), `households` (own), `gmach_posts`, `life_events` (own household), `meet_the_family`, `contact_messages` (own) |
| Household-scoped | `purim_selections`, `high_holiday_registrations` — only own household or ADMIN |
| Admin-only write | All tables allow full CRUD for ADMIN role |

---

## 3. Global Layout & UI Standards

### 3.1 Standardized Header

Every page must include a **Global Header** containing:
- The community **logo** (`logo.png`).
- The **site title** ("CommunityHub" or the community name).
- Consistent placement across Guest, Member, and Admin views.
- RTL-aware layout (logo on the right for Hebrew).

### 3.2 Action Consistency

- **Primary actions** (Save, Submit, Add) appear in the same relative position across all screens (top-right for Hebrew RTL layouts).
- **Back/navigation** links use the shared `BackLink` component and appear in a consistent position.
- **Destructive actions** (Delete, Reject) are visually distinct (`btn-danger` style) and require confirmation.

### 3.3 Banner & Hero Proportions

- The landing page hero banner must be **compact and proportional** — it should not dominate the viewport. A height of approximately 200–250px is the target (currently too tall).
- The hero should contain: community name/tagline, and a subtle brand gradient. No full-screen hero.

### 3.4 Branding Rules

- All colors derive from `logo.png`: purple (`#7C3AED`), blue (`#2563EB`), dark accent (`#111827`).
- Single source of truth in `globals.css` via `@theme inline` (Tailwind v4).
- Typography: Heebo font family (Hebrew + Latin support).

---

## 4. The Prayer Scheduling Engine

### 4.1 Architecture

The engine is rule-based: each `schedule_entries` row is a **template/rule** that defines *when* and *how* a prayer occurs. The system evaluates all rules against a given date to produce a concrete daily schedule.

```
schedule_entries (rules)
    ↓ filtered by day_type + season + overrides
    ↓ time resolved via calculatePrayerTime()
PrayerEvent[] (concrete schedule for homepage)
```

### 4.2 Applicability Rules (When)

| Field | Values | Purpose |
|-------|--------|---------|
| `day_types` | `weekday`, `shabbat`, `holiday`, `specific_date` | Which day types this rule applies to (array, multi-select) |
| `specific_date` | DATE | For one-off events (used when `specific_date` is in `day_types`) |
| `season` | `always`, `winter_only`, `summer_only` | Seasonal filtering. Winter = Nov–Mar, Summer = Apr–Oct |

### 4.3 Time Calculation (How)

Three modes via `time_type`:

| Mode | Fields used | Example |
|------|-------------|---------|
| **FIXED** | `fixed_hour`, `fixed_minute` | Shacharit at 08:00 |
| **ZMANIM_BASED** | `zman_key` | Prayer at sunset (exact time from Hebcal) |
| **DYNAMIC_OFFSET** | `zman_key` + `offset_minutes` | 20 minutes before sunset (`sunset` + `-20`) |

**Rounding:** Optional `round_to` field (e.g., 5 minutes) ensures prayers don't start at awkward times like 18:13 → rounds to 18:15.

**Supported Zmanim** (from Hebcal API):
`sunrise`, `sunset`, `chatzot`, `alotHaShachar`, `misheyakir`, `minchaGedola`, `minchaKetana`, `plagHaMincha`, `tzeit7083deg`

### 4.4 Manual Overrides

The `schedule_overrides` table allows per-entry, per-date overrides:
- **Cancel** a prayer for a specific date (e.g., fast day, community event).
- **Reschedule** to a different time for a specific date.
- Each override has an optional `reason` text.

### 4.5 Zmanim Integration

- Fetched from `https://www.hebcal.com/zmanim` per day, cached in-memory.
- Location configurable via env vars: `ZMANIM_LATITUDE`, `ZMANIM_LONGITUDE`, `ZMANIM_TZID` (defaults to Jerusalem).
- Times are parsed directly from the ISO string (timezone-safe, no `Date.getHours()` dependency).
- If the API is unavailable, FIXED entries still render; ZMANIM/OFFSET entries are gracefully skipped.

---

## 5. Core Modules

### 5.1 Member Directory

- Searchable list of households with tag filtering (e.g., Rabbi, Doctor, Volunteer).
- Privacy toggles per user: `show_phone_in_dir`, `show_email_in_dir`.

### 5.2 Gmach (Community Help) Board

- Category-based posts (color-coded). Categories: tools, meals, rides, furniture, clothing, other.
- Admin/Committee can pin posts with a "Priority" badge.
- Members can add posts; only Admin can delete.

### 5.3 Life Events

- Members can record births and yahrzeits (anniversaries of death).
- Linked to household via `household_id`.

### 5.4 Project-Based Finance

- Admin creates projects (e.g., "Building Fund", "Kiddush").
- Income/expense ledger per project, with amounts stored in cents.
- Admin-only access. Architecture supports future payment gateway integration.

---

## 6. Content Modules (New)

### 6.1 Mazal Tov Board

A dynamic section on the **Member landing page** celebrating community simchas (happy events).

- Displays recent simchas: births, engagements, weddings, bar/bat mitzvahs, etc.
- Admin-managed: Admin creates entries with a name, event type, date, and optional message.
- Visually prominent with festive styling (e.g., gold/warm accent, celebratory icons).
- Shows the most recent entries (e.g., last 30 days) in a scrollable or card-based layout.
- Access: visible to **Members and Admins** only.

### 6.2 D'var Torah (Weekly Torah Insight)

A managed space for weekly Torah insights, controlled by Admin.

- Admin publishes a D'var Torah entry: title, author, body text, and parasha/date reference.
- The most recent entry is displayed on the homepage (Member view) as a collapsible card.
- Archive: a dedicated `/dvar-torah` page lists past entries.
- Access: **public** (Guests can see the current D'var Torah on the landing page as a preview; full archive requires Member access).

### 6.3 Community Announcements

A formal feed for news and updates from the community board/administration.

- Admin publishes announcements: title, body, optional pinned flag, optional expiry date.
- Active announcements appear on the homepage as a banner or card stack.
- Expired announcements auto-hide from the homepage but remain accessible in an archive.
- Access: **public** (visible to Guests on the landing page).

### 6.4 "Meet the Family" Spotlight

An internal section that highlights a rotating community household each week/period.

- Admin selects a household to spotlight. The system displays: family name, a short bio/intro text, and optional photo.
- Displayed on the Member landing page as a featured card.
- Only one household is spotlighted at a time; Admin rotates manually (or future: auto-rotate).
- Access: **Members and Admins only** (not visible to Guests).

---

## 7. Seasonal Modules (Admin-Toggled)

Enabled/disabled via `system_toggles` table. When disabled, the corresponding UI is hidden.

### 7.1 High Holiday Seat Registration

- **Per-household** registration (manager submits for the family).
- Admin defines prayers via `hh_prayers` table (e.g., "Kol Nidrei", "Musaf").
- Per-prayer seat allocation: separate counts for men's section (`men_seats`) and women's section (`women_seats`).
- Committee interest and prep-slot fields.

### 7.2 Purim (Mishloach Manot)

- **Per-household** selection of a tier: "Full Community", "20 Families", or "5 Families".
- Household manager selects recipient households from a checklist.
- Admin generates a "Recipient Aggregator" report showing who chose to give to each family.

---

## 8. New Pages

### 8.1 Contact Us

A functional contact form for user feedback, questions, or issue reporting.

- Fields: name (auto-filled if signed in), email, subject, message body.
- Submissions are stored in a `contact_messages` table and visible to Admins.
- Admin can view and manage messages in the Admin Control Tower.
- Access: **Members and Admins** (Guests are directed to sign in first).

### 8.2 Gallery (Future)

A dedicated page for community event photos.

- Linked to Supabase Storage for image uploads.
- Admin uploads photos, tags them by event/date.
- Members browse galleries; Guests cannot access.
- **Status: Future feature.** Architecture should consider a `gallery_albums` + `gallery_photos` table structure and Supabase Storage bucket, but no implementation now.

---

## 9. Admin Control Tower

Sidebar-based navigation with the following sections:

| Section | Features |
|---------|----------|
| **Overview** | KPI stats: total members, pending requests, active projects, seasonal module status |
| **User Queue** | List of PENDING users with Approve/Reject actions. Approving creates household + user linkage |
| **Schedule Manager** | Full CRUD for prayer rules: day types, time modes (fixed/zmanim/offset), rounding, season. Edit + delete inline |
| **Locations** | Manage venues: name, capacity, space category (Indoor/Covered/OpenAir/Protected) |
| **Finance Hub** | Project management, income/expense logging, general ledger |
| **Content Manager** | CRUD for Mazal Tov entries, D'var Torah posts, and Community Announcements. "Meet the Family" household selector |
| **High Holidays** | Manage prayer list, view registrations per household |
| **Purim Report** | Recipient aggregation report |
| **Contact Messages** | View and manage submitted contact form messages |
| **Settings** | Toggle seasonal modules (Rosh Hashanah, Purim) |

All admin tables support **Excel export** via the `xlsx` library.

---

## 10. Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | NextAuth.js (Credentials provider, JWT sessions, bcrypt) |
| Styling | Tailwind CSS v4 (`@theme inline` in globals.css) |
| PWA | next-pwa (service worker, offline schedule access) |
| Zmanim | Hebcal REST API with server-side caching |
| Language | Hebrew UI (RTL). Code and documentation in English |

### 10.1 Code Architecture

```
src/
├── app/                    # Next.js App Router pages + server actions
│   ├── admin/              # Admin Control Tower (schedule, finance, content, etc.)
│   ├── auth/               # Sign-in, sign-up, forgot-password
│   ├── api/seed/           # Development seed endpoint
│   └── (public pages)      # directory, gmach, life-events, high-holidays, purim,
│                           # dvar-torah, contact, meet-the-family
├── components/             # Shared UI: GlobalHeader, FormFeedback, FilterTabs,
│                           # BackLink, SignOutButton, etc.
└── lib/                    # Business logic
    ├── zmanim.ts           # Hebcal API + calculatePrayerTime()
    ├── schedule.ts         # buildDailyScheduleForDate() — the engine
    ├── schedule-entries.ts # ScheduleEntry type + service layer
    ├── db-*.ts             # Supabase DB access (typed rows + unwrap helpers)
    ├── action-utils.ts     # ActionResult type, safeAction(), form helpers
    └── auth-guard.ts       # requireAdmin() / requireMember()
```

### 10.2 Error Handling

- `src/app/error.tsx` — route-level error boundary (Hebrew UI, "try again" + "home" buttons).
- `src/app/global-error.tsx` — root-level fallback (inline styles, no CSS dependency).
- All server actions wrapped in `safeAction()` — catches exceptions and returns `{ ok: false, error }`.

### 10.3 Accessibility

- Semantic HTML with ARIA roles/labels.
- Full keyboard navigation (Tab, Enter/Space).
- WCAG AA color contrast.
- Visible focus outlines and inline error/success feedback.
- Skip-to-content link.
