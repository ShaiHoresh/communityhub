"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { dbCreateHhPrayer, dbUpdateHhPrayer, dbDeleteHhPrayer } from "@/lib/db-hh-prayers";
import { revalidatePath } from "next/cache";

export async function addHhPrayerAction(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const sortOrder = parseInt((formData.get("sortOrder") as string) ?? "0", 10);

  if (!name) {
    return { ok: false, error: "שם התפילה הוא שדה חובה." };
  }

  await dbCreateHhPrayer(name, isNaN(sortOrder) ? 0 : sortOrder);
  revalidatePath("/admin/high-holidays");
  revalidatePath("/high-holidays");
  return { ok: true };
}

export async function updateHhPrayerAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const sortOrder = parseInt((formData.get("sortOrder") as string) ?? "0", 10);

  if (!id || !name) {
    return { ok: false, error: "שם ומזהה הם שדות חובה." };
  }

  await dbUpdateHhPrayer(id, name, isNaN(sortOrder) ? 0 : sortOrder);
  revalidatePath("/admin/high-holidays");
  revalidatePath("/high-holidays");
  return { ok: true };
}

export async function deleteHhPrayerAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { ok: false, error: "מזהה חסר." };

  await dbDeleteHhPrayer(id);
  revalidatePath("/admin/high-holidays");
  revalidatePath("/high-holidays");
  return { ok: true };
}
