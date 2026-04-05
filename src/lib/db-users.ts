import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList, unwrapMaybe, unwrapCount } from "@/lib/supabase-helpers";
import type { UserStatus, User } from "@/lib/households";

export type DbUserRow = {
  id: string;
  full_name: string;
  email: string | null;
  password_hash: string | null;
  status: UserStatus;
};

interface PendingUserRow {
  id: string;
  full_name: string;
  email: string | null;
}

interface HouseholdIdRow {
  household_id: string | null;
}

export async function dbFindUserByEmail(email: string): Promise<DbUserRow | null> {
  const normalized = email.trim().toLowerCase();
  const sb = supabaseAdmin();
  return unwrapMaybe(
    await sb
      .from("users")
      .select("id, full_name, email, password_hash, status")
      .ilike("email", normalized)
      .maybeSingle(),
  );
}

export async function dbCreatePendingUser(input: {
  fullName: string;
  email: string;
  passwordHash: string;
}): Promise<{ id: string }> {
  const sb = supabaseAdmin();
  const data = unwrap(
    await sb
      .from("users")
      .insert({
        full_name: input.fullName,
        email: input.email.trim().toLowerCase(),
        password_hash: input.passwordHash,
        status: "PENDING",
      })
      .select("id")
      .single(),
  );
  return { id: data.id };
}

export async function dbGetPendingUsers(): Promise<
  Array<{ id: string; fullName: string; email?: string }>
> {
  const sb = supabaseAdmin();
  return unwrapList(
    await sb
      .from("users")
      .select("id, full_name, email, status")
      .eq("status", "PENDING")
      .order("created_at", { ascending: true }),
  ).map((r: PendingUserRow) => ({
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

export async function dbGetUserHouseholdId(userId: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const data = unwrapMaybe<HouseholdIdRow>(
    await sb.from("users").select("household_id").eq("id", userId).maybeSingle(),
  );
  return data?.household_id ?? null;
}

export async function dbUpsertUser(input: {
  email: string;
  fullName: string;
  passwordHash: string;
  status: UserStatus;
  householdId?: string | null;
  role?: string | null;
}): Promise<{ id: string }> {
  const sb = supabaseAdmin();
  const normalizedEmail = input.email.trim().toLowerCase();

  const { data: existing, error: existingErr } = await sb
    .from("users")
    .select("id")
    .ilike("email", normalizedEmail)
    .maybeSingle();
  if (existingErr) throw existingErr;

  if (existing?.id) {
    const { error } = await sb
      .from("users")
      .update({
        full_name: input.fullName,
        password_hash: input.passwordHash,
        status: input.status,
        household_id: input.householdId ?? null,
        role: input.role ?? null,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return { id: existing.id as string };
  }

  const data = unwrap(
    await sb
      .from("users")
      .insert({
        full_name: input.fullName,
        email: normalizedEmail,
        password_hash: input.passwordHash,
        status: input.status,
        household_id: input.householdId ?? null,
        role: input.role ?? null,
      })
      .select("id")
      .single(),
  );
  return { id: data.id };
}

const FULL_USER_SELECT =
  "id, full_name, phone, email, password_hash, status, household_id, role, directory_tags, show_phone_in_dir, show_email_in_dir";

interface FullUserRow {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  password_hash: string | null;
  status: UserStatus;
  household_id: string | null;
  role: string | null;
  directory_tags: string[] | null;
  show_phone_in_dir: boolean | null;
  show_email_in_dir: boolean | null;
}

function mapFullUserRow(r: FullUserRow): User {
  return {
    id: r.id,
    fullName: r.full_name,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    passwordHash: r.password_hash ?? undefined,
    status: r.status,
    householdId: r.household_id ?? null,
    role: r.role ?? undefined,
    directoryTags: (r.directory_tags as User["directoryTags"]) ?? undefined,
    showPhoneInDirectory: r.show_phone_in_dir ?? undefined,
    showEmailInDirectory: r.show_email_in_dir ?? undefined,
  };
}

export async function dbGetUserById(userId: string): Promise<User | null> {
  const sb = supabaseAdmin();
  const data = unwrapMaybe<FullUserRow>(
    await sb.from("users").select(FULL_USER_SELECT).eq("id", userId).maybeSingle(),
  );
  return data ? mapFullUserRow(data) : null;
}

export async function dbUpdateUserProfile(
  userId: string,
  input: {
    fullName: string;
    phone?: string;
    showPhoneInDir: boolean;
    showEmailInDir: boolean;
  },
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("users")
    .update({
      full_name: input.fullName,
      phone: input.phone ?? null,
      show_phone_in_dir: input.showPhoneInDir,
      show_email_in_dir: input.showEmailInDir,
    })
    .eq("id", userId);
  if (error) throw error;
}

export async function dbUpdateUserPassword(userId: string, newHash: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("users")
    .update({ password_hash: newHash })
    .eq("id", userId);
  if (error) throw error;
}

export async function dbSetUserHousehold(userId: string, householdId: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("users")
    .update({ household_id: householdId })
    .eq("id", userId);
  if (error) throw error;
}

export async function dbGetActiveMembersCount(): Promise<number> {
  const sb = supabaseAdmin();
  const { count, error } = await sb
    .from("users")
    .select("id", { count: "exact", head: true })
    .in("status", ["MEMBER", "ADMIN"]);
  return unwrapCount({ count, error });
}

