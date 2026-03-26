-- ============================================================
-- CommunityHub – Phase 9a: Contact Us
-- Run in Supabase SQL Editor.
-- ============================================================

CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

-- RLS: anyone can submit (public insert); only ADMIN can read/manage
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY contact_insert ON contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY contact_admin ON contact_messages
  FOR ALL USING (current_user_status() = 'ADMIN');
