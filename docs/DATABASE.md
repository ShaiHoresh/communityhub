# Database

This document describes the database schema and relationships used by CommunityHub. The app currently uses **in-memory stores** (see `src/lib/*.ts`); when you switch to **Supabase**, run `scripts/schema.sql` and `scripts/rls.sql` in the SQL Editor.

---

## Tables and relationships

### Core

| Table | Description | Key relationships |
|-------|-------------|-------------------|
| **households** | Family unit (billing, registration). | – |
| **users** | Account: name, email, password_hash, **status** (PENDING \| MEMBER \| ADMIN), **household_id** → households.id. | users.household_id → households.id |
| **household_managers** | Which users can manage which household (multi-manager). | (household_id, user_id) → households, users |

### Schedule and locations

| Table | Description | Key relationships |
|-------|-------------|-------------------|
| **locations** | Venue name and max capacity. | – |
| **prayers_lessons** | Schedule events (title, type, start_time, event_date, seasonal_offset for Shabbat Mincha). | location_id → locations.id |

### Finance and Gmach

| Table | Description | Key relationships |
|-------|-------------|-------------------|
| **projects** | Finance project (e.g. Building Fund, Kiddush). | – |
| **gmach_categories** | Category id, label, color. | – |
| **gmach_posts** | Board item (category, title, description, is_pinned_by_committee). | category_id → gmach_categories.id |

### Requests and life events

| Table | Description | Key relationships |
|-------|-------------|-------------------|
| **access_requests** | Request to join or create a household (requester details, status: pending \| approved \| rejected). | – |
| **life_events** | Births and yahrzeits (type, name, date). | household_id → households.id (optional) |

---

## Roles and visibility (RLS summary)

When using Supabase, Row Level Security enforces:

- **GUEST (not signed in):** Can read **locations** and **prayers_lessons** (next prayers on landing).
- **PENDING:** Can read/update only **own user** row.
- **MEMBER:** Can read directory-relevant **users**, **households** (own), **gmach_posts**, **life_events**; can insert/update own **life_events** and **gmach_posts** as per policies.
- **ADMIN:** Full access to all tables (User Queue, Schedule Manager, Finance Hub, System Toggles).

See `scripts/rls.sql` for the exact policies.

---

## Seed (development)

To test roles locally without Supabase:

1. Run the app: `npm run dev`.
2. Open **GET /api/seed** once (e.g. http://localhost:3000/api/seed).
3. Sign in at `/auth/signin` with:
   - **admin@test.com** (ADMIN)
   - **member1@test.com** or **member2@test.com** (MEMBER, same household)
   - **pending@test.com** (PENDING)

Password for all: **Test1234!**

Seed implementation: `src/lib/seed.ts`.
