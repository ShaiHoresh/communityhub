import { supabaseAdmin } from "@/lib/supabase-admin";
import type { UserStatus } from "@/lib/households";

export type DbUserRow = {
  id: string;
  full_name: string;
  email: string | null;
  password_hash: string | null;
  status: UserStatus;
};

export async function dbFindUserByEmail(email: string): Promise<DbUserRow | null> {
  const normalized = email.trim().toLowerCase();
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("users")
    .select("id, full_name, email, password_hash, status")
    .ilike("email", normalized)
    .maybeSingle();
  if (error) throw error;
  return (data as DbUserRow | null) ?? null;
}

export async function dbCreatePendingUser(input: {
  fullName: string;
  email: string;
  passwordHash: string;
}): Promise<{ id: string }> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("users")
    .insert({
      full_name: input.fullName,
      email: input.email.trim().toLowerCase(),
      password_hash: input.passwordHash,
      status: "PENDING",
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id };
}

export async function dbGetPendingUsers(): Promise<
  Array<{ id: string; fullName: string; email?: string }>
> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("users")
    .select("id, full_name, email, status")
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    fullName: r.full_name,
    email: r.email ?? undefined,
  }));
}

export async function dbSetUserStatus(userId: string, status: UserStatus) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("users").update({ status }).eq("id", userId);
  if (error) throw error;
  return { success: true as const };
}

export async function dbGetActiveMembersCount(): Promise<number> {
  const sb = supabaseAdmin();
  const { count, error } = await sb
    .from("users")
    .select("id", { count: "exact", head: true })
    .in("status", ["MEMBER", "ADMIN"]);
  if (error) throw error;
  return count ?? 0;
}

