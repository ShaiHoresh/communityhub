import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrapList } from "@/lib/supabase-helpers";
import type { DirectoryTag } from "@/lib/households";

export type DirectoryUserRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  household_id: string | null;
  directory_tags: string[] | null;
  show_phone_in_dir: boolean | null;
  show_email_in_dir: boolean | null;
  // PostgREST may return the related record as an object OR array depending
  // on version/relationship cardinality — handle both.
  households: { name: string }[] | { name: string } | null;
};

export type DbDirectoryEntry = {
  userId: string;
  fullName: string;
  householdName: string | null;
  phone: string | null;
  email: string | null;
  tags: DirectoryTag[];
};

function normalizeTags(tags: string[] | null): DirectoryTag[] {
  const arr = Array.isArray(tags) ? tags : [];
  return arr.filter((t) => t === "rabbi" || t === "doctor" || t === "volunteer" || t === "other");
}

export async function dbGetDirectoryEntries(filterTag?: DirectoryTag): Promise<DbDirectoryEntry[]> {
  const sb = supabaseAdmin();

  // We only list approved users (MEMBER/ADMIN) who belong to a household.
  // Privacy flags determine whether email/phone is shown.
  const data = unwrapList<DirectoryUserRow>(
    await sb
      .from("users")
      .select(
        "id, full_name, phone, email, status, household_id, directory_tags, show_phone_in_dir, show_email_in_dir, households(name)",
      )
      .in("status", ["MEMBER", "ADMIN"])
      .not("household_id", "is", null),
  );

  const mapped: DbDirectoryEntry[] = data.map((u: DirectoryUserRow) => ({
    userId: u.id,
    fullName: u.full_name,
    householdName: Array.isArray(u.households)
      ? (u.households[0]?.name ?? null)
      : (u.households?.name ?? null),
    phone: u.show_phone_in_dir !== false && u.phone ? u.phone : null,
    email: u.show_email_in_dir !== false && u.email ? u.email : null,
    tags: normalizeTags(u.directory_tags),
  }));

  if (filterTag) return mapped.filter((e) => e.tags.includes(filterTag));
  return mapped;
}

