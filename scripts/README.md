# Scripts

- **schema.sql** – Supabase/Postgres schema (households, users, locations, prayers_lessons, projects, gmach_posts, access_requests, life_events). Run in Supabase SQL Editor when using Supabase.
- **rls.sql** – Row Level Security policies for ADMIN / MEMBER / PENDING / GUEST. Run after schema when using Supabase.
- **Seed (dev):** Run **GET http://localhost:3000/api/seed** once with the app running (`npm run dev`). Creates:
  - **admin@test.com** (ADMIN), **member1@test.com** / **member2@test.com** (MEMBER, same household), **pending@test.com** (PENDING)
  - Password for all: **Test1234!**
  - One sample project. Implementation: `src/lib/seed.ts`.
