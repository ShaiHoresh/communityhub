-- ============================================================
-- CommunityHub – Schedule Refactor (State/Conditional/Muting)
-- Run in Supabase SQL Editor.
-- ============================================================

-- 1) Extend schedule_entries for conditional fixed-time mode.
ALTER TABLE schedule_entries
  ADD COLUMN IF NOT EXISTS safety_buffer_minutes INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fallback_offset_minutes INT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_schedule_entries_safety_buffer_minutes'
  ) THEN
    ALTER TABLE schedule_entries
      ADD CONSTRAINT chk_schedule_entries_safety_buffer_minutes
      CHECK (safety_buffer_minutes >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_schedule_entries_fallback_offset_minutes'
  ) THEN
    ALTER TABLE schedule_entries
      ADD CONSTRAINT chk_schedule_entries_fallback_offset_minutes
      CHECK (fallback_offset_minutes >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_schedule_entries_time_type_v2'
  ) THEN
    ALTER TABLE schedule_entries
      ADD CONSTRAINT chk_schedule_entries_time_type_v2
      CHECK (time_type IN ('FIXED','ZMANIM_BASED','DYNAMIC_OFFSET','CONDITIONAL_FIXED'));
  END IF;
END $$;

-- Drop older time_type constraint if it exists.
ALTER TABLE schedule_entries
  DROP CONSTRAINT IF EXISTS chk_time_type;

-- 2) Single-date custom entries (not bound to existing recurring row).
CREATE TABLE IF NOT EXISTS date_specific_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('shacharit','mincha','arvit','lesson')),
  title TEXT NOT NULL,
  time_type TEXT NOT NULL DEFAULT 'FIXED'
    CHECK (time_type IN ('FIXED','ZMANIM_BASED','DYNAMIC_OFFSET','CONDITIONAL_FIXED')),
  fixed_hour INT CHECK (fixed_hour >= 0 AND fixed_hour <= 23),
  fixed_minute INT CHECK (fixed_minute >= 0 AND fixed_minute <= 59),
  zman_key TEXT CHECK (zman_key IN (
    'sunrise','sunset','chatzot','alotHaShachar','misheyakir',
    'minchaGedola','minchaKetana','plagHaMincha','tzeit7083deg'
  )),
  offset_minutes INT NOT NULL DEFAULT 0,
  safety_buffer_minutes INT NOT NULL DEFAULT 0 CHECK (safety_buffer_minutes >= 0),
  fallback_offset_minutes INT NOT NULL DEFAULT 0 CHECK (fallback_offset_minutes >= 0),
  round_to INT NOT NULL DEFAULT 0 CHECK (round_to IN (0,5,10,15,20,30)),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_date_specific_schedules_date ON date_specific_schedules(date);
CREATE INDEX IF NOT EXISTS idx_date_specific_schedules_location_date ON date_specific_schedules(location_id, date);

-- 3) Muting recurring entries on specific dates.
CREATE TABLE IF NOT EXISTS muted_schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_entry_id UUID NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
  muted_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (schedule_entry_id, muted_date)
);

CREATE INDEX IF NOT EXISTS idx_muted_schedule_entries_date ON muted_schedule_entries(muted_date);

-- 4) RLS
ALTER TABLE date_specific_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE muted_schedule_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS date_specific_schedules_select ON date_specific_schedules;
CREATE POLICY date_specific_schedules_select ON date_specific_schedules
  FOR SELECT USING (true);
DROP POLICY IF EXISTS date_specific_schedules_admin ON date_specific_schedules;
CREATE POLICY date_specific_schedules_admin ON date_specific_schedules
  FOR ALL USING (current_user_status() = 'ADMIN');

DROP POLICY IF EXISTS muted_schedule_entries_select ON muted_schedule_entries;
CREATE POLICY muted_schedule_entries_select ON muted_schedule_entries
  FOR SELECT USING (true);
DROP POLICY IF EXISTS muted_schedule_entries_admin ON muted_schedule_entries;
CREATE POLICY muted_schedule_entries_admin ON muted_schedule_entries
  FOR ALL USING (current_user_status() = 'ADMIN');
