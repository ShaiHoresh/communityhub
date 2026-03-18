-- CommunityHub – Supabase/PostgreSQL schema
-- Run this in Supabase SQL Editor (or any Postgres client) when using Supabase.

-- Roles / status for gatekeeper
CREATE TYPE user_status AS ENUM ('PENDING', 'MEMBER', 'ADMIN');

-- Households (core entity for billing, registration, family)
CREATE TABLE households (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users (accounts; multiple users can belong to one household)
CREATE TABLE users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name            TEXT NOT NULL,
  email                TEXT UNIQUE,
  phone                TEXT,
  password_hash        TEXT,
  status               user_status NOT NULL DEFAULT 'PENDING',
  household_id         UUID REFERENCES households(id) ON DELETE SET NULL,
  role                 TEXT,
  directory_tags       TEXT[],
  show_phone_in_dir    BOOLEAN DEFAULT true,
  show_email_in_dir    BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_household ON users(household_id);
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_status ON users(status);

-- Household managers (many-to-many: which users can manage which household)
CREATE TABLE household_managers (
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (household_id, user_id)
);

-- Locations (for prayers/lessons and capacity)
CREATE TABLE locations (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  max_capacity INT NOT NULL DEFAULT 0,
  space_category TEXT NOT NULL DEFAULT 'Indoor' CHECK (space_category IN ('Indoor','Covered','OpenAir','Protected'))
);

-- Prayers / lessons (schedule events; supports Shabbat Mincha logic)
CREATE TABLE prayers_lessons (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             TEXT NOT NULL REFERENCES locations(id),
  title                   TEXT NOT NULL,
  type                    TEXT NOT NULL,
  start_time              TIMESTAMPTZ NOT NULL,
  event_date              DATE NOT NULL,
  seasonal_offset_minutes INT DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prayers_date ON prayers_lessons(event_date);

-- Projects (for finance tracking)
CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions (income/expense per project; ledger)
CREATE TABLE transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  description  TEXT,
  date         DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- Gmach categories (reference)
CREATE TABLE gmach_categories (
  id    TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT
);

-- Gmach posts (community board)
CREATE TABLE gmach_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id         TEXT NOT NULL REFERENCES gmach_categories(id),
  title               TEXT NOT NULL,
  description         TEXT,
  contact_info        TEXT,
  is_pinned_by_committee BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gmach_category ON gmach_posts(category_id);

-- Access requests (before or alongside registration)
CREATE TABLE access_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                TEXT NOT NULL,
  household_name_or_id TEXT NOT NULL,
  requester_name      TEXT NOT NULL,
  requester_email     TEXT NOT NULL,
  requester_phone     TEXT,
  second_adult_name   TEXT,
  second_adult_email  TEXT,
  second_adult_phone  TEXT,
  notes               TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         TEXT
);

-- Life events (births, yahrzeits)
CREATE TABLE life_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL,
  name         TEXT NOT NULL,
  date         DATE NOT NULL,
  household_id UUID REFERENCES households(id),
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_life_events_date ON life_events(date);

-- Schedule entry templates (admin-managed; used to build the daily schedule)
CREATE TABLE schedule_entries (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                      TEXT NOT NULL,
  title                     TEXT NOT NULL,
  location_id               TEXT NOT NULL REFERENCES locations(id),
  hour                      INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
  minute                    INT NOT NULL CHECK (minute >= 0 AND minute <= 59),
  use_seasonal_mincha_offset BOOLEAN NOT NULL DEFAULT false,
  sort_order                INT NOT NULL DEFAULT 0,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedule_entries_order ON schedule_entries(sort_order);

-- Purim selections (seasonal module)
CREATE TABLE purim_selections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier       TEXT NOT NULL CHECK (tier IN ('full', 'twenty', 'five')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE purim_selection_recipients (
  selection_id UUID NOT NULL REFERENCES purim_selections(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  PRIMARY KEY (selection_id, household_id)
);

CREATE INDEX idx_purim_recipients_household ON purim_selection_recipients(household_id);

-- High Holidays registrations (seasonal module)
CREATE TABLE high_holiday_registrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  household_name      TEXT,
  seats               INT NOT NULL CHECK (seats > 0),
  committee_interest  TEXT NOT NULL DEFAULT '',
  prep_slot           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX idx_high_holiday_prep_slot ON high_holiday_registrations(prep_slot);

-- System toggles (feature flags)
CREATE TABLE system_toggles (
  key     TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
