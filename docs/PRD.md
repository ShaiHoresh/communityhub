# CommunityHub — Product Requirements Document (PRD)

## 1. Executive Summary

CommunityHub is a comprehensive management platform (Web/PWA) for a Synagogue or Community Center, built with **Next.js 16**, **Supabase (PostgreSQL)**, and **Tailwind CSS**. Primary language is Hebrew (RTL).

It serves three pillars:

| Pillar | Capabilities |
|--------|-------------|
| **Utility** | Dynamic prayer/lesson scheduling with Zmanim (Hebcal) integration, seasonal rules, and admin overrides. |
| **Community** | Household-based member directory, life events (births/yahrzeits), and a Gmach (peer-to-peer help) board. |
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
| **Guest** | Unauthenticated. Sees only the next upcoming prayer and sign-in/sign-up buttons. |
| **Pending** | Authenticated but not yet approved. Sees a "Waiting for Admin Approval" screen. Cannot access member areas. |
| **Member** | Full access to Directory, Gmach, Life Events, and seasonal registration (if enabled). |
| **Admin** | Everything a Member can do, plus the Admin Control Tower (user approval, schedule management, finance, system toggles). |

### 2.3 Authentication

- **NextAuth.js** with Credentials provider and JWT sessions.
- Registration creates an account with email + bcrypt-hashed password → user enters `PENDING` state.
- Admin approves via the User Queue → user promoted to `MEMBER` and assigned to a household.
- Middleware enforces role-based route protection. Server actions include defense-in-depth `requireAdmin()` checks.

### 2.4 Row Level Security (Supabase RLS)

Every table has RLS enabled. Key policies:

| Scope | Rule |
|-------|------|
| Public read | `locations`, `schedule_entries`, `schedule_overrides`, `hh_prayers`, `system_toggles` |
| Member read | `users` (MEMBER/ADMIN rows), `households` (own), `gmach_posts`, `life_events` (own household) |
| Household-scoped | `purim_selections`, `high_holiday_registrations` — only own household or ADMIN |
| Admin-only write | All tables allow full CRUD for ADMIN role |

---

## 3. The Prayer Scheduling Engine

### 3.1 Architecture

The engine is rule-based: each `schedule_entries` row is a **template/rule** that defines *when* and *how* a prayer occurs. The system evaluates all rules against a given date to produce a concrete daily schedule.

```
schedule_entries (rules)
    ↓ filtered by day_type + season + overrides
    ↓ time resolved via calculatePrayerTime()
PrayerEvent[] (concrete schedule for homepage)
```

### 3.2 Applicability Rules (When)

| Field | Values | Purpose |
|-------|--------|---------|
| `day_types` | `weekday`, `shabbat`, `holiday`, `specific_date` | Which day types this rule applies to (array, multi-select) |
| `specific_date` | DATE | For one-off events (used when `specific_date` is in `day_types`) |
| `season` | `always`, `winter_only`, `summer_only` | Seasonal filtering. Winter = Nov–Mar, Summer = Apr–Oct |

### 3.3 Time Calculation (How)

Three modes via `time_type`:

| Mode | Fields used | Example |
|------|-------------|---------|
| **FIXED** | `fixed_hour`, `fixed_minute` | Shacharit at 08:00 |
| **ZMANIM_BASED** | `zman_key` | Prayer at sunset (exact time from Hebcal) |
| **DYNAMIC_OFFSET** | `zman_key` + `offset_minutes` | 20 minutes before sunset (`sunset` + `-20`) |

**Rounding:** Optional `round_to` field (e.g., 5 minutes) ensures prayers don't start at awkward times like 18:13 → rounds to 18:15.

**Supported Zmanim** (from Hebcal API):
`sunrise`, `sunset`, `chatzot`, `alotHaShachar`, `misheyakir`, `minchaGedola`, `minchaKetana`, `plagHaMincha`, `tzeit7083deg`

### 3.4 Manual Overrides

The `schedule_overrides` table allows per-entry, per-date overrides:
- **Cancel** a prayer for a specific date (e.g., fast day, community event).
- **Reschedule** to a different time for a specific date.
- Each override has an optional `reason` text.

### 3.5 Zmanim Integration

- Fetched from `https://www.hebcal.com/zmanim` per day, cached in-memory.
- Location configurable via env vars: `ZMANIM_LATITUDE`, `ZMANIM_LONGITUDE`, `ZMANIM_TZID` (defaults to Jerusalem).
- Times are parsed directly from the ISO string (timezone-safe, no `Date.getHours()` dependency).
- If the API is unavailable, FIXED entries still render; ZMANIM/OFFSET entries are gracefully skipped.

---

## 4. Core Modules

### 4.1 Member Directory

- Searchable list of households with tag filtering (e.g., Rabbi, Doctor, Volunteer).
- Privacy toggles per user: `show_phone_in_dir`, `show_email_in_dir`.

### 4.2 Gmach (Community Help) Board

- Category-based posts (color-coded). Categories: tools, meals, rides, furniture, clothing, other.
- Admin/Committee can pin posts with a "Priority" badge.
- Members can add posts; only Admin can delete.

### 4.3 Life Events

- Members can record births and yahrzeits (anniversaries of death).
- Linked to household via `household_id`.

### 4.4 Project-Based Finance

- Admin creates projects (e.g., "Building Fund", "Kiddush").
- Income/expense ledger per project, with amounts stored in cents.
- Admin-only access. Architecture supports future payment gateway integration.

---

## 5. Seasonal Modules (Admin-Toggled)

Enabled/disabled via `system_toggles` table. When disabled, the corresponding UI is hidden.

### 5.1 High Holiday Seat Registration

- **Per-household** registration (manager submits for the family).
- Admin defines prayers via `hh_prayers` table (e.g., "Kol Nidrei", "Musaf").
- Per-prayer seat allocation: separate counts for men's section (`men_seats`) and women's section (`women_seats`).
- Committee interest and prep-slot fields.

### 5.2 Purim (Mishloach Manot)

- **Per-household** selection of a tier: "Full Community", "20 Families", or "5 Families".
- Household manager selects recipient households from a checklist.
- Admin generates a "Recipient Aggregator" report showing who chose to give to each family.

---

## 6. Admin Control Tower

Sidebar-based navigation with the following sections:

| Section | Features |
|---------|----------|
| **Overview** | KPI stats: total members, pending requests, active projects, seasonal module status |
| **User Queue** | List of PENDING users with Approve/Reject actions. Approving creates household + user linkage |
| **Schedule Manager** | Full CRUD for prayer rules: day types, time modes (fixed/zmanim/offset), rounding, season. Edit + delete inline |
| **Locations** | Manage venues: name, capacity, space category (Indoor/Covered/OpenAir/Protected) |
| **Finance Hub** | Project management, income/expense logging, general ledger |
| **High Holidays** | Manage prayer list, view registrations per household |
| **Purim Report** | Recipient aggregation report |
| **Settings** | Toggle seasonal modules (Rosh Hashanah, Purim) |

All admin tables support **Excel export** via the `xlsx` library.

---

## 7. Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | NextAuth.js (Credentials provider, JWT sessions, bcrypt) |
| Styling | Tailwind CSS v4 (`@theme inline` in globals.css) |
| PWA | next-pwa (service worker, offline schedule access) |
| Zmanim | Hebcal REST API with server-side caching |
| Language | Hebrew UI (RTL). Code and documentation in English |

### 7.1 Code Architecture

```
src/
├── app/                    # Next.js App Router pages + server actions
│   ├── admin/              # Admin Control Tower (schedule, finance, locations, etc.)
│   ├── auth/               # Sign-in, sign-up, forgot-password
│   ├── api/seed/           # Development seed endpoint
│   └── (public pages)      # directory, gmach, life-events, high-holidays, purim
├── components/             # Shared UI: FormFeedback, FilterTabs, BackLink, SignOutButton, etc.
└── lib/                    # Business logic
    ├── zmanim.ts           # Hebcal API + calculatePrayerTime()
    ├── schedule.ts         # buildDailyScheduleForDate() — the engine
    ├── schedule-entries.ts # ScheduleEntry type + service layer
    ├── db-*.ts             # Supabase DB access (typed rows + unwrap helpers)
    ├── action-utils.ts     # ActionResult type, safeAction(), form helpers
    └── auth-guard.ts       # requireAdmin() / requireMember()
```

### 7.2 Error Handling

- `src/app/error.tsx` — route-level error boundary (Hebrew UI, "try again" + "home" buttons).
- `src/app/global-error.tsx` — root-level fallback (inline styles, no CSS dependency).
- All server actions wrapped in `safeAction()` — catches exceptions and returns `{ ok: false, error }`.

### 7.3 Accessibility

- Semantic HTML with ARIA roles/labels.
- Full keyboard navigation (Tab, Enter/Space).
- WCAG AA color contrast.
- Visible focus outlines and inline error/success feedback.
- Skip-to-content link.
