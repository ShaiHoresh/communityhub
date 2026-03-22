-- Row Level Security (RLS) for Supabase
-- Run after schema.sql. Assumes Supabase Auth: auth.uid() is the user's id.

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
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE purim_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE purim_selection_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hh_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_holiday_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hh_registration_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's status
CREATE OR REPLACE FUNCTION current_user_status()
RETURNS user_status AS $$
  SELECT status FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- households: MEMBER sees own; ADMIN sees all
CREATE POLICY households_select_own ON households
  FOR SELECT USING (
    id IN (SELECT household_id FROM users WHERE id = auth.uid() AND household_id IS NOT NULL)
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY households_all_admin ON households
  FOR ALL USING (current_user_status() = 'ADMIN');

-- users: PENDING sees own row; MEMBER+ sees MEMBER/ADMIN rows; ADMIN full access
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

-- locations: public read; ADMIN write
CREATE POLICY locations_select ON locations FOR SELECT USING (true);
CREATE POLICY locations_admin ON locations FOR ALL USING (current_user_status() = 'ADMIN');

-- prayers_lessons: public read; ADMIN write
CREATE POLICY prayers_select ON prayers_lessons FOR SELECT USING (true);
CREATE POLICY prayers_admin ON prayers_lessons FOR ALL USING (current_user_status() = 'ADMIN');

-- projects: ADMIN only
CREATE POLICY projects_admin ON projects FOR ALL USING (current_user_status() = 'ADMIN');

-- transactions: ADMIN only
CREATE POLICY transactions_admin ON transactions FOR ALL USING (current_user_status() = 'ADMIN');

-- gmach_categories: MEMBER+ read; ADMIN write
CREATE POLICY gmach_categories_select ON gmach_categories
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_categories_admin ON gmach_categories
  FOR ALL USING (current_user_status() = 'ADMIN');

-- gmach_posts: MEMBER+ read/insert; ADMIN full
CREATE POLICY gmach_posts_select ON gmach_posts
  FOR SELECT USING (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_posts_insert ON gmach_posts
  FOR INSERT WITH CHECK (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY gmach_posts_admin ON gmach_posts
  FOR ALL USING (current_user_status() = 'ADMIN');

-- access_requests: ADMIN only
CREATE POLICY access_requests_admin ON access_requests
  FOR ALL USING (current_user_status() = 'ADMIN');

-- life_events: MEMBER+ read own household; MEMBER+ insert; ADMIN full
CREATE POLICY life_events_select ON life_events
  FOR SELECT USING (
    current_user_status() IN ('MEMBER', 'ADMIN')
    AND (household_id IS NULL OR household_id IN (SELECT household_id FROM users WHERE id = auth.uid()))
  );
CREATE POLICY life_events_insert ON life_events
  FOR INSERT WITH CHECK (current_user_status() IN ('MEMBER', 'ADMIN'));
CREATE POLICY life_events_admin ON life_events
  FOR ALL USING (current_user_status() = 'ADMIN');

-- schedule_entries: public read; ADMIN write
CREATE POLICY schedule_entries_select ON schedule_entries FOR SELECT USING (true);
CREATE POLICY schedule_entries_admin ON schedule_entries FOR ALL USING (current_user_status() = 'ADMIN');

-- purim_selections: own household or ADMIN
CREATE POLICY purim_selections_select ON purim_selections
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM users WHERE id = auth.uid())
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY purim_selections_admin ON purim_selections
  FOR ALL USING (current_user_status() = 'ADMIN');

-- purim_selection_recipients: public read; ADMIN write
CREATE POLICY purim_recipients_select ON purim_selection_recipients FOR SELECT USING (true);
CREATE POLICY purim_recipients_admin ON purim_selection_recipients
  FOR ALL USING (current_user_status() = 'ADMIN');

-- hh_prayers: public read; ADMIN write
CREATE POLICY hh_prayers_select ON hh_prayers FOR SELECT USING (true);
CREATE POLICY hh_prayers_admin ON hh_prayers FOR ALL USING (current_user_status() = 'ADMIN');

-- high_holiday_registrations: own household or ADMIN
CREATE POLICY hh_registrations_select ON high_holiday_registrations
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM users WHERE id = auth.uid())
    OR current_user_status() = 'ADMIN'
  );
CREATE POLICY hh_registrations_admin ON high_holiday_registrations
  FOR ALL USING (current_user_status() = 'ADMIN');

-- hh_registration_seats: public read; ADMIN write
CREATE POLICY hh_seats_select ON hh_registration_seats FOR SELECT USING (true);
CREATE POLICY hh_seats_admin ON hh_registration_seats
  FOR ALL USING (current_user_status() = 'ADMIN');

-- system_toggles: public read; ADMIN write
CREATE POLICY system_toggles_select ON system_toggles FOR SELECT USING (true);
CREATE POLICY system_toggles_admin ON system_toggles FOR ALL USING (current_user_status() = 'ADMIN');
