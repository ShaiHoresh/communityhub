-- Row Level Security (RLS) for Supabase
-- Run after schema.sql. Assumes Supabase Auth: auth.uid() is the user's id (or link public.users.id to auth.users.id).

-- Enable RLS on all tables
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

-- Helper: get current user's status (assuming public.users.id = auth.uid())
CREATE OR REPLACE FUNCTION current_user_status()
RETURNS user_status AS $$
  SELECT status FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Who can see what:
-- GUEST (not signed in): only public schedule (prayers_lessons, locations for schedule)
-- PENDING: own user row only
-- MEMBER: directory (users with show_*), gmach, life_events, own household
-- ADMIN: full access

-- households: MEMBER sees own; ADMIN sees all
CREATE POLICY households_select_own ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM users WHERE id = auth.uid() AND household_id IS NOT NULL)
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY households_all_admin ON households
  FOR ALL USING (current_user_status() = 'ADMIN');

-- users: everyone can read directory-visible fields for MEMBERs (simplified: MEMBER+ see users in same household or all with show_phone/show_email); PENDING sees own row; ADMIN sees all
CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = auth.uid());
CREATE POLICY users_select_members ON users
  FOR SELECT USING (
    current_user_status() IN ('MEMBER', 'ADMIN')
    AND (status = 'MEMBER' OR status = 'ADMIN')
  );
CREATE POLICY users_all_admin ON users
  FOR ALL USING (current_user_status() = 'ADMIN');

-- household_managers: MEMBER sees for own household; ADMIN all
CREATE POLICY household_managers_select ON household_managers
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM users WHERE id = auth.uid())
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY household_managers_admin ON household_managers
  FOR ALL USING (current_user_status() = 'ADMIN');

-- locations: public read (for schedule)
CREATE POLICY locations_select ON locations
  FOR SELECT USING (true);

CREATE POLICY locations_admin ON locations
  FOR ALL USING (current_user_status() = 'ADMIN');

-- prayers_lessons: public read (guest sees next prayers)
CREATE POLICY prayers_select ON prayers_lessons
  FOR SELECT USING (true);
CREATE POLICY prayers_admin ON prayers_lessons
  FOR ALL USING (current_user_status() = 'ADMIN');

-- projects: only ADMIN (Finance Hub)
CREATE POLICY projects_admin ON projects
  FOR ALL USING (current_user_status() = 'ADMIN');

-- gmach_categories: MEMBER+ read
CREATE POLICY gmach_categories_select ON gmach_categories
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_categories_admin ON gmach_categories
  FOR ALL USING (current_user_status() = 'ADMIN');

-- gmach_posts: MEMBER+ read; ADMIN can write
CREATE POLICY gmach_posts_select ON gmach_posts
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_posts_insert ON gmach_posts
  FOR INSERT WITH CHECK (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_posts_admin ON gmach_posts
  FOR ALL USING (current_user_status() = 'ADMIN');

-- access_requests: only ADMIN (User Queue)
CREATE POLICY access_requests_admin ON access_requests
  FOR ALL USING (current_user_status() = 'ADMIN');

-- life_events: MEMBER+ read/write own or household
CREATE POLICY life_events_select ON life_events
  FOR SELECT USING (
    current_user_status() IN ('MEMBER', 'ADMIN')
    AND (household_id IS NULL OR household_id IN (SELECT household_id FROM users WHERE id = auth.uid()))
  );
CREATE POLICY life_events_insert ON life_events
  FOR INSERT WITH CHECK (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY life_events_admin ON life_events
  FOR ALL USING (current_user_status() = 'ADMIN');
