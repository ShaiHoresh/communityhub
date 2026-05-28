-- ============================================================
-- Migration: Revoke public read access on the users table
-- ============================================================
-- The `users` table contains PII (name, email, phone, status).
-- RLS policies already restrict row-level access, but the
-- underlying GRANT still allowed the `anon` and `authenticated`
-- roles to attempt SELECT queries.  We lock this down so that
-- only the server-side service_role (which bypasses RLS) can
-- read the table directly — all authenticated lookups must go
-- through the application layer.
--
-- Run once on the production database via the Supabase SQL editor.
-- Safe to re-run (REVOKE is idempotent when no privilege exists).
-- ============================================================

-- Remove SELECT privilege from public roles
REVOKE SELECT ON public.users FROM anon;
REVOKE SELECT ON public.users FROM authenticated;

-- Ensure the server-side admin client retains full access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role;
