-- Migration: add password_reset_tokens table
-- Run once in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_email      ON password_reset_tokens(email);

-- RLS: no direct client access — all operations go through the service-role key.
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- No public policies; the supabaseAdmin() client bypasses RLS.
