import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList, unwrapMaybe } from "@/lib/supabase-helpers";
import type { DirectoryTag, Household, HouseholdId, User, UserId, UserStatus } from "@/lib/households";

interface HouseholdRow {
  id: string;
  name: string;
}

interface UserRow {
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

function mapHouseholdRow(r: HouseholdRow): Household {
  return {
    id: r.id,
    name: r.name,
  };
}

function mapUserRow(r: UserRow): User {
  return {
    id: r.id,
    fullName: r.full_name,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    passwordHash: r.password_hash ?? undefined,
    status: (r.status ?? "PENDING") as UserStatus,
    householdId: r.household_id ?? null,
    role: r.role ?? undefined,
    directoryTags: (r.directory_tags as DirectoryTag[] | null) ?? undefined,
    showPhoneInDirectory: r.show_phone_in_dir ?? undefined,
    showEmailInDirectory: r.show_email_in_dir ?? undefined,
  };
}

export async function dbCreateHousehold(name: string): Promise<Household> {
  const sb = supabaseAdmin();
  const data = unwrap(
    await sb.from("households").insert({ name }).select("id, name").single(),
  );
  return mapHouseholdRow(data);
}

export async function dbGetHouseholdById(id: HouseholdId): Promise<Household | undefined> {
  const sb = supabaseAdmin();
  const data = unwrapMaybe(
    await sb.from("households").select("id, name").eq("id", id).maybeSingle(),
  );
  return data ? mapHouseholdRow(data) : undefined;
}

export async function dbGetHouseholds(): Promise<Array<{ id: string; name: string }>> {
  const sb = supabaseAdmin();
  return unwrapList(
    await sb.from("households").select("id, name").order("created_at", { ascending: true }),
  ).map((r: HouseholdRow) => ({ id: r.id, name: r.name }));
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
  const data = unwrap(
    await sb
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
      .single(),
  );
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

export async function dbGetHouseholdMembers(
  householdId: HouseholdId,
): Promise<User[]> {
  const sb = supabaseAdmin();
  return unwrapList(
    await sb
      .from("users")
      .select(
        "id, full_name, phone, email, password_hash, status, household_id, role, directory_tags, show_phone_in_dir, show_email_in_dir",
      )
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
  ).map(mapUserRow);
}

/**
 * Assigns an already-existing user to a household and registers them as a manager.
 * Used when an admin approves a PENDING user who signed up directly (not via access-request form).
 */
export async function dbAssignUserToHousehold(
  userId: UserId,
  householdId: HouseholdId,
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("users")
    .update({ household_id: householdId })
    .eq("id", userId);
  if (error) throw error;
  await dbAddHouseholdManager(householdId, userId);
}

export async function dbIsHouseholdManager(
  householdId: HouseholdId,
  userId: UserId,
): Promise<boolean> {
  const sb = supabaseAdmin();
  const data = unwrapMaybe(
    await sb
      .from("household_managers")
      .select("user_id")
      .eq("household_id", householdId)
      .eq("user_id", userId)
      .maybeSingle(),
  );
  return !!data;
}

