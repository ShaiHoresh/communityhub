-- Migration: Prayer Engine overhaul
-- Upgrades schedule_entries from simple hour/minute to full prayer engine
-- with day types, zmanim-based timing, seasonal rules, and manual overrides.
--
-- Run this in the Supabase SQL Editor for existing databases.
-- For fresh installs, just use the updated schema.sql + rls.sql.

-- Step 1: Add new columns to schedule_entries
ALTER TABLE schedule_entries
  ADD COLUMN IF NOT EXISTS day_types       TEXT[] NOT NULL DEFAULT '{weekday,shabbat}',
  ADD COLUMN IF NOT EXISTS specific_date   DATE,
  ADD COLUMN IF NOT EXISTS season          TEXT NOT NULL DEFAULT 'always',
  ADD COLUMN IF NOT EXISTS time_type       TEXT NOT NULL DEFAULT 'FIXED',
  ADD COLUMN IF NOT EXISTS fixed_hour      INT,
  ADD COLUMN IF NOT EXISTS fixed_minute    INT,
  ADD COLUMN IF NOT EXISTS zman_key        TEXT,
  ADD COLUMN IF NOT EXISTS offset_minutes  INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS round_to        INT NOT NULL DEFAULT 0;

-- Step 2: Migrate existing data (hour/minute → fixed_hour/fixed_minute)
UPDATE schedule_entries
SET fixed_hour  = hour,
    fixed_minute = minute,
    time_type   = 'FIXED',
    day_types   = '{weekday,shabbat}',
    season      = 'always'
WHERE fixed_hour IS NULL;

-- Step 3: Add constraints
ALTER TABLE schedule_entries
  ADD CONSTRAINT chk_season      CHECK (season IN ('always','winter_only','summer_only')),
  ADD CONSTRAINT chk_time_type   CHECK (time_type IN ('FIXED','ZMANIM_BASED','DYNAMIC_OFFSET')),
  ADD CONSTRAINT chk_fixed_hour  CHECK (fixed_hour >= 0 AND fixed_hour <= 23),
  ADD CONSTRAINT chk_fixed_min   CHECK (fixed_minute >= 0 AND fixed_minute <= 59),
  ADD CONSTRAINT chk_round_to    CHECK (round_to >= 0);

-- Step 4: Drop old columns
ALTER TABLE schedule_entries
  DROP COLUMN IF EXISTS hour,
  DROP COLUMN IF EXISTS minute,
  DROP COLUMN IF EXISTS use_seasonal_mincha_offset;

-- Step 5: Create schedule_overrides table
CREATE TABLE IF NOT EXISTS schedule_overrides (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_entry_id UUID NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
  override_date     DATE NOT NULL,
  is_cancelled      BOOLEAN NOT NULL DEFAULT false,
  override_hour     INT CHECK (override_hour >= 0 AND override_hour <= 23),
  override_minute   INT CHECK (override_minute >= 0 AND override_minute <= 59),
  reason            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (schedule_entry_id, override_date)
);

CREATE INDEX IF NOT EXISTS idx_schedule_overrides_date ON schedule_overrides(override_date);

-- Step 6: RLS for schedule_overrides
ALTER TABLE schedule_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY schedule_overrides_select ON schedule_overrides
  FOR SELECT USING (true);
CREATE POLICY schedule_overrides_admin ON schedule_overrides
  FOR ALL USING (current_user_status() = 'ADMIN');
