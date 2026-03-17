import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Household, HouseholdId, User, UserId, UserStatus } from "@/lib/households";

function mapHouseholdRow(r: any): Household {
  return {
    id: r.id,
    name: r.name,
    memberIds: [],
    managerIds: [],
  };
}

function mapUserRow(r: any): User {
  return {
    id: r.id,
    fullName: r.full_name,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    passwordHash: r.password_hash ?? undefined,
    status: (r.status ?? "PENDING") as UserStatus,
    householdId: r.household_id ?? null,
    role: r.role ?? undefined,
    directoryTags: r.directory_tags ?? undefined,
    showPhoneInDirectory: r.show_phone_in_dir ?? undefined,
    showEmailInDirectory: r.show_email_in_dir ?? undefined,
  };
}

export async function dbCreateHousehold(name: string): Promise<Household> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("households")
    .insert({ name })
    .select("id, name")
    .single();
  if (error) throw error;
  return mapHouseholdRow(data);
}

export async function dbGetHouseholdById(id: HouseholdId): Promise<Household | undefined> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("households")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapHouseholdRow(data) : undefined;
}

export async function dbGetHouseholds(): Promise<Array<{ id: string; name: string }>> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("households")
    .select("id, name")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.name }));
}

export async function dbCreateHouseholdUser(input: {
  fullName: string;
  email?: string;
  phone?: string;
  householdId: HouseholdId;
  role?: string;
  status?: UserStatus;
}): Promise<User> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("users")
    .insert({
      full_name: input.fullName,
      email: input.email?.trim().toLowerCase() ?? null,
      phone: input.phone ?? null,
      household_id: input.householdId,
      role: input.role ?? null,
      status: input.status ?? "MEMBER",
    })
    .select(
      "id, full_name, phone, email, password_hash, status, household_id, role, directory_tags, show_phone_in_dir, show_email_in_dir",
    )
    .single();
  if (error) throw error;
  return mapUserRow(data);
}

export async function dbAddHouseholdManager(
  householdId: HouseholdId,
  userId: UserId,
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("household_managers")
    .insert({ household_id: householdId, user_id: userId });
  if (error) throw error;
}

