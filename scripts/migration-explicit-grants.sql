-- ============================================================
-- Migration: Explicit Data API grants
-- Run this in the Supabase SQL Editor on the production project.
-- ============================================================
--
-- WHY THIS IS NEEDED
-- ------------------
-- Supabase announced a breaking change (effective October 30, 2026) where
-- the default privileges that automatically exposed every public-schema table
-- to the Data API (PostgREST / supabase-js) will be revoked on all existing
-- projects. After that date, any new table created without an explicit GRANT
-- will be unreachable via the Data API with a "permission denied" error.
--
-- Existing tables keep their current implicit grants until that date, but
-- running this migration NOW locks in the grants explicitly, making the project
-- safe regardless of when Supabase enforces the change.
--
-- The app uses only the service_role key server-side (all DB access goes
-- through supabaseAdmin() which bypasses RLS). The anon/authenticated grants
-- below are minimal read-only baselines for the tables whose RLS policies
-- already allow public or member access, in case client-side access is added.
--
-- REFERENCE
-- ---------
-- https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
-- ============================================================

-- Full access for the server-side admin client (all 25 tables)
GRANT SELECT, INSERT, UPDATE, DELETE ON
  access_requests,
  announcements,
  contact_messages,
  dvar_torah,
  gmach_categories,
  gmach_posts,
  high_holiday_registrations,
  hh_prayers,
  hh_registration_seats,
  household_managers,
  households,
  life_events,
  locations,
  mazal_tov,
  meet_the_family,
  password_reset_tokens,
  projects,
  purim_selection_recipients,
  purim_selections,
  schedule_entries,
  schedule_overrides,
  system_toggles,
  transactions,
  users
TO service_role;

-- Public read-only (tables whose RLS already allows anon access)
GRANT SELECT ON
  announcements,
  dvar_torah,
  gmach_categories,
  gmach_posts,
  locations,
  schedule_entries,
  schedule_overrides
TO anon;

-- anon may submit contact messages (RLS policy: contact_insert allows all)
GRANT INSERT ON contact_messages TO anon;

-- Authenticated members can read member-gated tables
GRANT SELECT ON
  announcements,
  dvar_torah,
  gmach_categories,
  gmach_posts,
  households,
  life_events,
  locations,
  mazal_tov,
  meet_the_family,
  schedule_entries,
  schedule_overrides
TO authenticated;

GRANT INSERT ON contact_messages TO authenticated;

-- ============================================================
-- OPTIONAL: Lock in the new default-privilege behavior now
-- so that any future table you create is NOT auto-exposed.
-- This matches what Supabase will enforce on October 30, 2026.
-- Uncomment only if you want to adopt the stricter default today.
-- ============================================================
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
--   REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
--   REVOKE USAGE, SELECT ON SEQUENCES FROM anon, authenticated, service_role;
