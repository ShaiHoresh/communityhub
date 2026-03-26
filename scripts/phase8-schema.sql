-- ============================================================
-- CommunityHub – Phase 8: Content Modules
-- Run this entire file in the Supabase SQL Editor.
-- ============================================================

-- ---------------------------------------------------------
-- 8a: Mazal Tov Board
-- ---------------------------------------------------------
CREATE TABLE mazal_tov (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
                 'birth', 'bar_mitzvah', 'bat_mitzvah',
                 'wedding', 'anniversary', 'other')),
  name       TEXT NOT NULL,
  message    TEXT,
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mazal_tov_date ON mazal_tov(date DESC);

-- RLS: MEMBER+ read; ADMIN write (service-role key bypasses in app)
ALTER TABLE mazal_tov ENABLE ROW LEVEL SECURITY;
CREATE POLICY mazal_tov_select ON mazal_tov
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY mazal_tov_admin ON mazal_tov
  FOR ALL USING (current_user_status() = 'ADMIN');

-- ---------------------------------------------------------
-- 8b: D'var Torah
-- ---------------------------------------------------------
CREATE TABLE dvar_torah (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  author     TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL,
  parasha    TEXT NOT NULL DEFAULT '',
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dvar_torah_date ON dvar_torah(date DESC);

-- RLS: public read (guests can see preview); ADMIN write
ALTER TABLE dvar_torah ENABLE ROW LEVEL SECURITY;
CREATE POLICY dvar_torah_select ON dvar_torah FOR SELECT USING (true);
CREATE POLICY dvar_torah_admin  ON dvar_torah FOR ALL USING (current_user_status() = 'ADMIN');

-- ---------------------------------------------------------
-- 8c: Community Announcements
-- ---------------------------------------------------------
CREATE TABLE announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_pinned  BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_created ON announcements(created_at DESC);

-- RLS: public read; ADMIN write
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_select ON announcements FOR SELECT USING (true);
CREATE POLICY announcements_admin  ON announcements FOR ALL USING (current_user_status() = 'ADMIN');

-- ---------------------------------------------------------
-- 8d: Meet the Family Spotlight
-- ---------------------------------------------------------
CREATE TABLE meet_the_family (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  bio          TEXT NOT NULL,
  photo_url    TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_spotlight_active ON meet_the_family(is_active);

-- RLS: MEMBER+ read; ADMIN write
ALTER TABLE meet_the_family ENABLE ROW LEVEL SECURITY;
CREATE POLICY spotlight_select ON meet_the_family
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY spotlight_admin ON meet_the_family
  FOR ALL USING (current_user_status() = 'ADMIN');
