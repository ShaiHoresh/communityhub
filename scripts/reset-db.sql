-- ============================================================
-- CommunityHub – Full DB Reset
-- Paste this ENTIRE file into Supabase SQL Editor and run once.
-- Then hit /api/seed in dev mode to populate test data.
-- ============================================================

-- ============================================================
-- STEP 1: Drop everything
-- ============================================================

DROP TABLE IF EXISTS hh_registration_seats CASCADE;
DROP TABLE IF EXISTS purim_selection_recipients CASCADE;
DROP TABLE IF EXISTS purim_selections CASCADE;
DROP TABLE IF EXISTS high_holiday_registrations CASCADE;
DROP TABLE IF EXISTS hh_prayers CASCADE;
DROP TABLE IF EXISTS gmach_posts CASCADE;
DROP TABLE IF EXISTS gmach_categories CASCADE;
DROP TABLE IF EXISTS life_events CASCADE;
DROP TABLE IF EXISTS schedule_entries CASCADE;
DROP TABLE IF EXISTS prayers_lessons CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS access_requests CASCADE;
DROP TABLE IF EXISTS household_managers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS households CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS system_toggles CASCADE;

DROP TYPE IF EXISTS user_status CASCADE;
DROP FUNCTION IF EXISTS current_user_status() CASCADE;

-- ============================================================
-- STEP 2: Restore schema permissions (needed if schema was dropped/recreated)
-- ============================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- ============================================================
-- STEP 3: Create schema (from schema.sql)
-- ============================================================

CREATE TYPE user_status AS ENUM ('PENDING', 'MEMBER', 'ADMIN');

CREATE TABLE households (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE household_managers (
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (household_id, user_id)
);

CREATE TABLE locations (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  max_capacity INT NOT NULL DEFAULT 0,
  space_category TEXT NOT NULL DEFAULT 'Indoor' CHECK (space_category IN ('Indoor','Covered','OpenAir','Protected'))
);

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

CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE gmach_categories (
  id    TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT
);

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

CREATE TABLE purim_selections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  tier         TEXT NOT NULL CHECK (tier IN ('full', 'twenty', 'five')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id)
);

CREATE TABLE purim_selection_recipients (
  selection_id UUID NOT NULL REFERENCES purim_selections(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  PRIMARY KEY (selection_id, household_id)
);

CREATE INDEX idx_purim_recipients_household ON purim_selection_recipients(household_id);

CREATE TABLE hh_prayers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hh_prayers_order ON hh_prayers(sort_order);

CREATE TABLE high_holiday_registrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id        UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  household_name      TEXT,
  committee_interest  TEXT NOT NULL DEFAULT '',
  prep_slot           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id)
);

CREATE INDEX idx_high_holiday_prep_slot ON high_holiday_registrations(prep_slot);

CREATE TABLE hh_registration_seats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES high_holiday_registrations(id) ON DELETE CASCADE,
  prayer_id       UUID NOT NULL REFERENCES hh_prayers(id) ON DELETE CASCADE,
  men_seats       INT NOT NULL DEFAULT 0 CHECK (men_seats >= 0),
  women_seats     INT NOT NULL DEFAULT 0 CHECK (women_seats >= 0),
  UNIQUE (registration_id, prayer_id)
);

CREATE INDEX idx_hh_reg_seats_registration ON hh_registration_seats(registration_id);

CREATE TABLE system_toggles (
  key     TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- STEP 4: Row Level Security (from rls.sql)
-- ============================================================

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmach_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmach_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE purim_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE purim_selection_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hh_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_holiday_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hh_registration_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_user_status()
RETURNS user_status AS $$
  SELECT status FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- households
CREATE POLICY households_select_own ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM users WHERE id = auth.uid() AND household_id IS NOT NULL)
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY households_all_admin ON households
  FOR ALL USING (current_user_status() = 'ADMIN');

-- users
CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY users_select_members ON users
  FOR SELECT USING (
    current_user_status() IN ('MEMBER', 'ADMIN')
    AND (status = 'MEMBER' OR status = 'ADMIN')
  );
CREATE POLICY users_all_admin ON users
  FOR ALL USING (current_user_status() = 'ADMIN');

-- household_managers
CREATE POLICY household_managers_select ON household_managers
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM users WHERE id = auth.uid())
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY household_managers_admin ON household_managers
  FOR ALL USING (current_user_status() = 'ADMIN');

-- locations
CREATE POLICY locations_select ON locations FOR SELECT USING (true);
CREATE POLICY locations_admin ON locations FOR ALL USING (current_user_status() = 'ADMIN');

-- prayers_lessons
CREATE POLICY prayers_select ON prayers_lessons FOR SELECT USING (true);
CREATE POLICY prayers_admin ON prayers_lessons FOR ALL USING (current_user_status() = 'ADMIN');

-- projects
CREATE POLICY projects_admin ON projects FOR ALL USING (current_user_status() = 'ADMIN');

-- transactions
CREATE POLICY transactions_admin ON transactions FOR ALL USING (current_user_status() = 'ADMIN');

-- gmach_categories
CREATE POLICY gmach_categories_select ON gmach_categories
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_categories_admin ON gmach_categories
  FOR ALL USING (current_user_status() = 'ADMIN');

-- gmach_posts
CREATE POLICY gmach_posts_select ON gmach_posts
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_posts_insert ON gmach_posts
  FOR INSERT WITH CHECK (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_posts_admin ON gmach_posts
  FOR ALL USING (current_user_status() = 'ADMIN');

-- access_requests
CREATE POLICY access_requests_admin ON access_requests
  FOR ALL USING (current_user_status() = 'ADMIN');

-- life_events
CREATE POLICY life_events_select ON life_events
  FOR SELECT USING (
    current_user_status() IN ('MEMBER', 'ADMIN')
    AND (household_id IS NULL OR household_id IN (SELECT household_id FROM users WHERE id = auth.uid()))
  );
CREATE POLICY life_events_insert ON life_events
  FOR INSERT WITH CHECK (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY life_events_admin ON life_events
  FOR ALL USING (current_user_status() = 'ADMIN');

-- schedule_entries
CREATE POLICY schedule_entries_select ON schedule_entries FOR SELECT USING (true);
CREATE POLICY schedule_entries_admin ON schedule_entries FOR ALL USING (current_user_status() = 'ADMIN');

-- purim_selections
CREATE POLICY purim_selections_select ON purim_selections
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM users WHERE id = auth.uid())
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY purim_selections_admin ON purim_selections
  FOR ALL USING (current_user_status() = 'ADMIN');

-- purim_selection_recipients
CREATE POLICY purim_recipients_select ON purim_selection_recipients FOR SELECT USING (true);
CREATE POLICY purim_recipients_admin ON purim_selection_recipients
  FOR ALL USING (current_user_status() = 'ADMIN');

-- hh_prayers
CREATE POLICY hh_prayers_select ON hh_prayers FOR SELECT USING (true);
CREATE POLICY hh_prayers_admin ON hh_prayers FOR ALL USING (current_user_status() = 'ADMIN');

-- high_holiday_registrations
CREATE POLICY hh_registrations_select ON high_holiday_registrations
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM users WHERE id = auth.uid())
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY hh_registrations_admin ON high_holiday_registrations
  FOR ALL USING (current_user_status() = 'ADMIN');

-- hh_registration_seats
CREATE POLICY hh_seats_select ON hh_registration_seats FOR SELECT USING (true);
CREATE POLICY hh_seats_admin ON hh_registration_seats
  FOR ALL USING (current_user_status() = 'ADMIN');

-- system_toggles
CREATE POLICY system_toggles_select ON system_toggles FOR SELECT USING (true);
CREATE POLICY system_toggles_admin ON system_toggles FOR ALL USING (current_user_status() = 'ADMIN');

-- ============================================================
-- Done! Now run /api/seed in dev mode to populate test data.
-- ============================================================
