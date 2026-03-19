/**
 * Development seed for Supabase:
 * Creates Admin, Member household (2 users + managers), Pending user.
 *
 * Test users (password for all: Test1234!):
 * - admin@test.com   → ADMIN
 * - member1@test.com, member2@test.com → MEMBER (same household, both managers)
 * - pending@test.com → PENDING
 */

import { supabaseAdmin } from "@/lib/supabase-admin";
import { hashPassword } from "@/lib/auth";
import { dbUpsertUser } from "@/lib/db-users";
import { dbEnsureGmachCategories } from "@/lib/db-gmach";
import { getGmachCategories } from "@/lib/gmach-categories";
import { dbEnsureLocations } from "@/lib/db-locations";
import { DEFAULT_LOCATIONS } from "@/lib/default-locations";
import { dbEnsureDefaultToggles } from "@/lib/db-system-toggles";

export const SEED_PASSWORD = "Test1234!";

export async function runSeed(): Promise<{ ok: boolean; message: string }> {
  const sb = supabaseAdmin();

  // Ensure core reference data exists
  await dbEnsureLocations(DEFAULT_LOCATIONS);
  await dbEnsureDefaultToggles();

  const passwordHash = await hashPassword(SEED_PASSWORD);

  // Admin user (no household)
  await dbUpsertUser({
    email: "admin@test.com",
    fullName: "מנהל מערכת",
    passwordHash,
    status: "ADMIN",
  });

  // Ensure a member household exists
  let householdId: string;
  const { data: existingHH, error: hhFindErr } = await sb
    .from("households")
    .select("id")
    .eq("name", "משפחת כהן (לדוגמה)")
    .maybeSingle();
  if (hhFindErr) throw hhFindErr;

  if (existingHH?.id) {
    householdId = existingHH.id as string;
  } else {
    const { data: hh, error: hhErr } = await sb
      .from("households")
      .insert({ name: "משפחת כהן (לדוגמה)" })
      .select("id")
      .single();
    if (hhErr) throw hhErr;
    householdId = (hh as { id: string }).id;
  }

  const member1 = await dbUpsertUser({
    email: "member1@test.com",
    fullName: "ישראל כהן",
    passwordHash,
    status: "MEMBER",
    householdId,
    role: "adult",
  });
  const member2 = await dbUpsertUser({
    email: "member2@test.com",
    fullName: "רחל כהן",
    passwordHash,
    status: "MEMBER",
    householdId,
    role: "adult",
  });

  // Ensure both members are household managers (upsert via ON CONFLICT)
  await sb.from("household_managers").upsert(
    [
      { household_id: householdId, user_id: member1.id },
      { household_id: householdId, user_id: member2.id },
    ],
    { onConflict: "household_id,user_id" },
  );

  // Pending user (no household until approved)
  await dbUpsertUser({
    email: "pending@test.com",
    fullName: "משתמש ממתין",
    passwordHash,
    status: "PENDING",
  });

  // Ensure default High Holiday prayers exist
  const { count: hhPrayerCount, error: hhPrayerCountErr } = await sb
    .from("hh_prayers")
    .select("id", { count: "exact", head: true });
  if (hhPrayerCountErr) throw hhPrayerCountErr;
  if ((hhPrayerCount ?? 0) === 0) {
    const defaultPrayers = [
      { name: "ערבית ראש השנה", sort_order: 1 },
      { name: "שחרית ראש השנה א׳", sort_order: 2 },
      { name: "מוסף ראש השנה א׳", sort_order: 3 },
      { name: "שחרית ראש השנה ב׳", sort_order: 4 },
      { name: "מוסף ראש השנה ב׳", sort_order: 5 },
      { name: "כל נדרי", sort_order: 6 },
      { name: "שחרית יום כיפור", sort_order: 7 },
      { name: "מוסף יום כיפור", sort_order: 8 },
      { name: "מנחה יום כיפור", sort_order: 9 },
      { name: "נעילה", sort_order: 10 },
    ];
    const { error: hhPrayerErr } = await sb.from("hh_prayers").insert(defaultPrayers);
    if (hhPrayerErr) throw hhPrayerErr;
  }

  // Ensure Gmach categories exist, and add a few default posts if empty
  await dbEnsureGmachCategories(getGmachCategories());
  const { count: postsCount, error: postsCountErr } = await sb
    .from("gmach_posts")
    .select("id", { count: "exact", head: true });
  if (postsCountErr) throw postsCountErr;
  if ((postsCount ?? 0) === 0) {
    const { error: postsErr } = await sb.from("gmach_posts").insert([
      {
        category_id: "books",
        title: "ספרי קודש להשאלה",
        description: "מגשרת עם ספרי קודש. לפנות בשעות הערב.",
        contact_info: "דרך הלוח",
        is_pinned_by_committee: true,
      },
      {
        category_id: "baby",
        title: "עגלת תינוק",
        description: "עגלה במצב טוב, למי שצריך.",
        contact_info: "פנה בדואר",
      },
      {
        category_id: "tools",
        title: "מקדחה וכלי עבודה",
        description: "השאלה לשבוע.",
      },
    ]);
    if (postsErr) throw postsErr;
  }

  return {
    ok: true,
    message: `Seed applied (Supabase). Sign in as admin@test.com | member1@test.com | member2@test.com | pending@test.com with password: ${SEED_PASSWORD}`,
  };
}
