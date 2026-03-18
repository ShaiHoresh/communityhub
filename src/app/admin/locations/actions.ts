"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_CATEGORIES = ["Indoor", "Covered", "OpenAir", "Protected"] as const;

function isCategory(v: string): v is (typeof ALLOWED_CATEGORIES)[number] {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(v);
}

export async function upsertLocationAction(formData: FormData) {
  const id = (formData.get("id") as string | null)?.trim();
  const name = (formData.get("name") as string | null)?.trim();
  const capStr = (formData.get("maxCapacity") as string | null)?.trim();
  const spaceCategoryRaw = (formData.get("spaceCategory") as string | null)?.trim();

  if (!id || !name || !capStr || !spaceCategoryRaw) {
    return { ok: false, error: "נא למלא מזהה, שם, קיבולת וסוג מרחב." };
  }

  const maxCapacity = parseInt(capStr, 10);
  if (!Number.isFinite(maxCapacity) || maxCapacity < 0) {
    return { ok: false, error: "קיבולת לא תקינה (מספר שלם, 0 או יותר)." };
  }
  if (!isCategory(spaceCategoryRaw)) {
    return { ok: false, error: "סוג מרחב לא תקין." };
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("locations").upsert(
    {
      id,
      name,
      max_capacity: maxCapacity,
      space_category: spaceCategoryRaw,
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/locations");
  revalidatePath("/admin/schedule");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteLocationAction(id: string) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("locations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/locations");
  revalidatePath("/admin/schedule");
  revalidatePath("/");
  return { ok: true };
}

