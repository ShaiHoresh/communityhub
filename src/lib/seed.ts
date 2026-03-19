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
import { dbEnsureGmachCategories } from "@/lib/db-gmach";
import { getGmachCategories } from "@/lib/gmach-categories";
import { dbEnsureLocations } from "@/lib/db-locations";
import { DEFAULT_LOCATIONS } from "@/lib/default-locations";
import { dbEnsureDefaultToggles } from "@/lib/db-system-toggles";

export const SEED_PASSWORD = "Test1234!";

async function upsertUserByEmail(input: {
  email: string;
  fullName: string;
  passwordHash: string;
  status: "PENDING" | "MEMBER" | "ADMIN";
  householdId?: string | null;
  role?: string | null;
}) {
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

  const { data, error } = await sb
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
    .single();
  if (error) throw error;
  return { id: (data as { id: string }).id };
}

export async function runSeed(): Promise<{ ok: boolean; message: string }> {
  const sb = supabaseAdmin();

  // Ensure core reference data exists
  await dbEnsureLocations(DEFAULT_LOCATIONS);
  await dbEnsureDefaultToggles();

  // If admin already exists, assume seed applied.
  const { data: existingAdmin, error: adminErr } = await sb
    .from("users")
    .select("id")
    .ilike("email", "admin@test.com")
    .maybeSingle();
  if (adminErr) throw adminErr;

  if (existingAdmin?.id) {
    return {
      ok: true,
      message:
        "Seed already applied (Supabase). Sign in as admin@test.com | member1@test.com | member2@test.com | pending@test.com with password: " +
        SEED_PASSWORD,
    };
  }

  const passwordHash = await hashPassword(SEED_PASSWORD);

  // Admin user (no household)
  await upsertUserByEmail({
    email: "admin@test.com",
    fullName: "מנהל מערכת",
    passwordHash,
    status: "ADMIN",
  });

  // One member household + 2 managers
  const { data: hh, error: hhErr } = await sb
    .from("households")
    .insert({ name: "משפחת כהן (לדוגמה)" })
    .select("id")
    .single();
  if (hhErr) throw hhErr;
  const householdId = (hh as { id: string }).id;

  const member1 = await upsertUserByEmail({
    email: "member1@test.com",
    fullName: "ישראל כהן",
    passwordHash,
    status: "MEMBER",
    householdId,
    role: "adult",
  });
  const member2 = await upsertUserByEmail({
    email: "member2@test.com",
    fullName: "רחל כהן",
    passwordHash,
    status: "MEMBER",
    householdId,
    role: "adult",
  });

  const { error: mgrErr } = await sb.from("household_managers").insert([
    { household_id: householdId, user_id: member1.id },
    { household_id: householdId, user_id: member2.id },
  ]);
  if (mgrErr) throw mgrErr;

  // Pending user (no household until approved)
  await upsertUserByEmail({
    email: "pending@test.com",
    fullName: "משתמש ממתין",
    passwordHash,
    status: "PENDING",
  });

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
