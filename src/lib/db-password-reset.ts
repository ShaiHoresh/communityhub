/**
 * DB helpers for password-reset tokens.
 *
 * Flow:
 *  1. dbCreateResetToken(email)  — creates a 1-hour token, returns the raw token string.
 *  2. dbValidateResetToken(token) — returns the email if the token is valid + unused.
 *  3. dbConsumeResetToken(token)  — marks the token as used (call after password is changed).
 *
 * The raw token is never stored — only its SHA-256 hex digest is persisted.
 */

import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const TOKEN_TTL_MINUTES = 60;

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** Create a reset token for the given email and return the raw (unhashed) token. */
export async function dbCreateResetToken(email: string): Promise<string> {
  const raw = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

  const sb = supabaseAdmin();
  const { error } = await sb.from("password_reset_tokens").insert({
    email: email.trim().toLowerCase(),
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (error) throw error;

  return raw;
}

/**
 * Validate a raw token.
 * Returns the email address if the token is valid, unused, and not expired.
 * Returns null otherwise.
 */
export async function dbValidateResetToken(raw: string): Promise<string | null> {
  const tokenHash = hashToken(raw);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("password_reset_tokens")
    .select("email, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as { email: string; expires_at: string; used_at: string | null };

  if (row.used_at) return null; // already consumed
  if (new Date(row.expires_at) < new Date()) return null; // expired

  return row.email;
}

/** Mark a token as used so it cannot be replayed. */
export async function dbConsumeResetToken(raw: string): Promise<void> {
  const tokenHash = hashToken(raw);
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("password_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash);
  if (error) throw error;
}
