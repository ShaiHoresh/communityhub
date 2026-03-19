-- Migration R1: Re-key seasonal registrations from user_id to household_id
-- Run this in Supabase SQL Editor BEFORE deploying the updated code.
-- This migration is NOT reversible without data loss.

BEGIN;

-- ============================================================
-- 1. Purim selections: add household_id, migrate data, swap constraint
-- ============================================================

-- Add household_id column (nullable for now)
ALTER TABLE purim_selections
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

-- Populate household_id from users.household_id
UPDATE purim_selections ps
SET household_id = u.household_id
FROM users u
WHERE ps.user_id = u.id
  AND u.household_id IS NOT NULL;

-- Remove rows where household_id is still NULL (user had no household)
DELETE FROM purim_selections WHERE household_id IS NULL;

-- Make household_id NOT NULL
ALTER TABLE purim_selections ALTER COLUMN household_id SET NOT NULL;

-- Drop old unique constraint on user_id
ALTER TABLE purim_selections DROP CONSTRAINT IF EXISTS purim_selections_user_id_key;

-- Add new unique constraint on household_id
ALTER TABLE purim_selections ADD CONSTRAINT purim_selections_household_id_key UNIQUE (household_id);

-- Drop user_id column (no longer needed)
ALTER TABLE purim_selections DROP COLUMN IF EXISTS user_id;

-- ============================================================
-- 2. High Holiday registrations: add household_id, migrate data, swap constraint
-- ============================================================

-- Add household_id column (nullable for now)
ALTER TABLE high_holiday_registrations
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

-- Populate household_id from users.household_id
UPDATE high_holiday_registrations hhr
SET household_id = u.household_id
FROM users u
WHERE hhr.user_id = u.id
  AND u.household_id IS NOT NULL;

-- For rows that already have household_name but no FK, try matching by name
UPDATE high_holiday_registrations hhr
SET household_id = h.id
FROM households h
WHERE hhr.household_id IS NULL
  AND hhr.household_name IS NOT NULL
  AND hhr.household_name = h.name;

-- Remove rows where household_id is still NULL
DELETE FROM high_holiday_registrations WHERE household_id IS NULL;

-- Make household_id NOT NULL
ALTER TABLE high_holiday_registrations ALTER COLUMN household_id SET NOT NULL;

-- Drop old unique constraint on user_id
ALTER TABLE high_holiday_registrations DROP CONSTRAINT IF EXISTS high_holiday_registrations_user_id_key;

-- Add new unique constraint on household_id
ALTER TABLE high_holiday_registrations ADD CONSTRAINT high_holiday_registrations_household_id_key UNIQUE (household_id);

-- Drop user_id and full_name columns (no longer needed; household_name stays as denormalized cache)
ALTER TABLE high_holiday_registrations DROP COLUMN IF EXISTS user_id;
ALTER TABLE high_holiday_registrations DROP COLUMN IF EXISTS full_name;

COMMIT;
