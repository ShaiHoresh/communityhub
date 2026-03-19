-- Migration R1b: Add per-prayer seat allocation for High Holidays
-- Run this in Supabase SQL Editor AFTER migration-r1-household-registration.sql

BEGIN;

-- 1. Create hh_prayers table (admin-configurable prayer list)
CREATE TABLE IF NOT EXISTS hh_prayers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hh_prayers_order ON hh_prayers(sort_order);

-- 2. Create per-prayer seat allocations table
CREATE TABLE IF NOT EXISTS hh_registration_seats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES high_holiday_registrations(id) ON DELETE CASCADE,
  prayer_id       UUID NOT NULL REFERENCES hh_prayers(id) ON DELETE CASCADE,
  men_seats       INT NOT NULL DEFAULT 0 CHECK (men_seats >= 0),
  women_seats     INT NOT NULL DEFAULT 0 CHECK (women_seats >= 0),
  UNIQUE (registration_id, prayer_id)
);

CREATE INDEX IF NOT EXISTS idx_hh_reg_seats_registration ON hh_registration_seats(registration_id);

-- 3. Drop the old single "seats" column from registrations (if it still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'high_holiday_registrations' AND column_name = 'seats'
  ) THEN
    ALTER TABLE high_holiday_registrations DROP COLUMN seats;
  END IF;
END $$;

-- 4. Seed default prayers (can be customized by admin later)
INSERT INTO hh_prayers (name, sort_order) VALUES
  ('ערבית ראש השנה', 1),
  ('שחרית ראש השנה א׳', 2),
  ('מוסף ראש השנה א׳', 3),
  ('שחרית ראש השנה ב׳', 4),
  ('מוסף ראש השנה ב׳', 5),
  ('כל נדרי', 6),
  ('שחרית יום כיפור', 7),
  ('מוסף יום כיפור', 8),
  ('מנחה יום כיפור', 9),
  ('נעילה', 10)
ON CONFLICT DO NOTHING;

COMMIT;
