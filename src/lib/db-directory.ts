import { supabaseAdmin } from "@/lib/supabase-admin";

export type DirectoryTag = "rabbi" | "doctor" | "volunteer" | "other";

export type DbDirectoryEntry = {
  userId: string;
  fullName: string;
  householdName: string | null;
  phone: string | null;
  email: string | null;
  tags: DirectoryTag[];
};

function normalizeTags(tags: any): DirectoryTag[] {
  const arr = Array.isArray(tags) ? tags : [];
  return arr.filter((t) => t === "rabbi" || t === "doctor" || t === "volunteer" || t === "other");
}

export async function dbGetDirectoryEntries(filterTag?: DirectoryTag): Promise<DbDirectoryEntry[]> {
  const sb = supabaseAdmin();

  // We only list approved users (MEMBER/ADMIN) who belong to a household.
  // Privacy flags determine whether email/phone is shown.
  const { data, error } = await sb
    .from("users")
    .select(
      "id, full_name, phone, email, status, household_id, directory_tags, show_phone_in_dir, show_email_in_dir, households(name)",
    )
    .in("status", ["MEMBER", "ADMIN"])
    .not("household_id", "is", null);
  if (error) throw error;

  const mapped: DbDirectoryEntry[] = (data ?? []).map((u: any) => ({
    userId: u.id,
    fullName: u.full_name,
    householdName: u.households?.name ?? null,
    phone: u.show_phone_in_dir !== false && u.phone ? u.phone : null,
    email: u.show_email_in_dir !== false && u.email ? u.email : null,
    tags: normalizeTags(u.directory_tags),
  }));

  if (filterTag) return mapped.filter((e) => e.tags.includes(filterTag));
  return mapped;
}

