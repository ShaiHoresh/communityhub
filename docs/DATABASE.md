# Database Schema

CommunityHub uses **Supabase (PostgreSQL)** with Row Level Security.

**Setup:** Run `scripts/reset-db.sql` in the Supabase SQL Editor, then seed via `/api/seed` in dev mode.

---

## Tables

### Core (Identity & Household)

| Table | Description | Key columns |
|-------|-------------|-------------|
| **households** | Family unit for billing and registration | `id`, `name` |
| **users** | User accounts | `id`, `full_name`, `email`, `password_hash`, `status` (PENDING/MEMBER/ADMIN), `household_id` → households |
| **household_managers** | Which users can act for a household | `(household_id, user_id)` — composite PK |

### Schedule & Locations

| Table | Description | Key columns |
|-------|-------------|-------------|
| **locations** | Venues with capacity | `id` (TEXT PK), `name`, `max_capacity`, `space_category` |
| **schedule_entries** | Prayer/lesson rules (templates) | `type`, `title`, `location_id`, `day_types[]`, `season`, `time_type`, `fixed_hour/minute`, `zman_key`, `offset_minutes`, `round_to` |
| **schedule_overrides** | Per-entry, per-date overrides | `schedule_entry_id`, `override_date`, `is_cancelled`, `override_hour/minute`, `reason` |
| **prayers_lessons** | Legacy event instances (not actively used) | `location_id`, `start_time`, `event_date` |

### Finance

| Table | Description | Key columns |
|-------|-------------|-------------|
| **projects** | Finance projects (e.g., "Building Fund") | `id`, `name` |
| **transactions** | Income/expense ledger | `project_id`, `type` (income/expense), `amount_cents`, `date` |

### Community

| Table | Description | Key columns |
|-------|-------------|-------------|
| **gmach_categories** | Category reference | `id` (TEXT PK), `label`, `color` |
| **gmach_posts** | Community board items | `category_id`, `title`, `description`, `is_pinned_by_committee` |
| **access_requests** | Household join/create requests | `type`, `requester_name/email`, `status` (pending/approved/rejected) |
| **life_events** | Births and yahrzeits | `type`, `name`, `date`, `household_id` |

### Seasonal Modules

| Table | Description | Key columns |
|-------|-------------|-------------|
| **purim_selections** | Per-household tier choice | `household_id` (UNIQUE), `tier` (full/twenty/five) |
| **purim_selection_recipients** | Which households a family chose | `selection_id`, `household_id` |
| **hh_prayers** | Admin-defined prayer list for High Holidays | `name`, `sort_order` |
| **high_holiday_registrations** | Per-household registration | `household_id` (UNIQUE), `committee_interest`, `prep_slot` |
| **hh_registration_seats** | Per-prayer seat allocation | `registration_id`, `prayer_id`, `men_seats`, `women_seats` |

### System

| Table | Description | Key columns |
|-------|-------------|-------------|
| **system_toggles** | Feature flags | `key` (TEXT PK), `enabled` |

---

## Schedule Entry Fields (Prayer Engine)

The `schedule_entries` table is the core of the prayer scheduling engine. Each row is a **rule** that defines when and how a prayer occurs.

### Applicability

| Column | Type | Values |
|--------|------|--------|
| `day_types` | TEXT[] | `weekday`, `shabbat`, `holiday`, `specific_date` |
| `specific_date` | DATE | Used only when `specific_date` is in `day_types` |
| `season` | TEXT | `always`, `winter_only`, `summer_only` |

### Time Calculation

| Column | Type | Purpose |
|--------|------|---------|
| `time_type` | TEXT | `FIXED`, `ZMANIM_BASED`, `DYNAMIC_OFFSET` |
| `fixed_hour` / `fixed_minute` | INT | For FIXED mode |
| `zman_key` | TEXT | Hebcal zman key (e.g., `sunset`, `sunrise`) |
| `offset_minutes` | INT | ± minutes from zman (DYNAMIC_OFFSET mode) |
| `round_to` | INT | Round result to nearest N minutes (0 = no rounding) |

---

## RLS Summary

| Access level | Tables |
|-------------|--------|
| **Public read** | locations, schedule_entries, schedule_overrides, hh_prayers, system_toggles |
| **Member read** | users (MEMBER/ADMIN rows), households (own), gmach_posts, life_events (own household) |
| **Household-scoped** | purim_selections, high_holiday_registrations (own household or ADMIN) |
| **Admin full CRUD** | All tables |

Helper function: `current_user_status()` — returns the calling user's status enum for RLS policy evaluation.

---

## Seed (Development)

Run `npm run dev` then open `/api/seed` (dev mode only).

| Email | Role | Password |
|-------|------|----------|
| admin@test.com | ADMIN | Test1234! |
| member1@test.com | MEMBER | Test1234! |
| member2@test.com | MEMBER | Test1234! |
| pending@test.com | PENDING | Test1234! |

Members 1 & 2 share a household ("משפחת ישראלי") and are both managers.

Seed implementation: `src/lib/seed.ts`
