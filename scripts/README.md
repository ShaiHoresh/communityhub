# Scripts

## Fresh Setup (new Supabase project)

1. Paste **`reset-db.sql`** into the Supabase SQL Editor and run it.
   It drops everything, restores schema grants, creates all tables, and applies RLS in one go.
2. Start the app (`npm run dev`) and open **http://localhost:3100/api/seed**.
   This creates test users, a household, default locations, toggles, gmach categories, and High Holiday prayers.

### Test accounts (all password: **Test1234!**)

| Email              | Role    |
|--------------------|---------|
| admin@test.com     | ADMIN   |
| member1@test.com   | MEMBER  |
| member2@test.com   | MEMBER  |
| pending@test.com   | PENDING |

## Migrating an existing database

If you already have data and don't want to reset, run the appropriate migration script in the SQL Editor:

| Script | Purpose |
|--------|---------|
| `migration-prayer-engine.sql` | Upgrades `schedule_entries` from hour/minute to the full prayer engine (day types, zmanim, seasons, overrides). |

## File reference

| File            | Purpose |
|-----------------|---------|
| `reset-db.sql`  | Full DB reset: drop + grants + schema + RLS. Use for fresh setup or when things get messy. |
| `schema.sql`    | Canonical table definitions (standalone, no drops/grants). Reference for the current schema. |
| `rls.sql`       | Row Level Security policies (standalone). Reference for current RLS rules. |
| `migration-prayer-engine.sql` | Migration: adds prayer engine columns to existing `schedule_entries`, creates `schedule_overrides`. |

> **Seed implementation:** `src/lib/seed.ts`
