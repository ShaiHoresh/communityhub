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

## File reference

| File            | Purpose |
|-----------------|---------|
| `reset-db.sql`  | Full DB reset: drop + grants + schema + RLS. Use for fresh setup or when things get messy. |
| `schema.sql`    | Canonical table definitions (standalone, no drops/grants). Reference for the current schema. |
| `rls.sql`       | Row Level Security policies (standalone). Reference for current RLS rules. |

> **Seed implementation:** `src/lib/seed.ts`
