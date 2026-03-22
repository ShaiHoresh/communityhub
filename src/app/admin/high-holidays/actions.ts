"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { dbCreateHhPrayer, dbUpdateHhPrayer, dbDeleteHhPrayer } from "@/lib/db-hh-prayers";
import {
  type ActionResult,
  parseFormString,
  parseFormInt,
  revalidateAdminPaths,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

export async function addHhPrayerAction(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const name = parseFormString(formData, "name");
    const sortOrder = parseFormInt(formData, "sortOrder", 0);

    if (!name) return { ok: false, error: "שם התפילה הוא שדה חובה." };

    await dbCreateHhPrayer(name, sortOrder);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function updateHhPrayerAction(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const id = parseFormString(formData, "id");
    const name = parseFormString(formData, "name");
    const sortOrder = parseFormInt(formData, "sortOrder", 0);

    if (!id || !name) return { ok: false, error: "שם ומזהה הם שדות חובה." };

    await dbUpdateHhPrayer(id, name, sortOrder);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function deleteHhPrayerAction(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const id = parseFormString(formData, "id");
    if (!id) return { ok: false, error: "מזהה חסר." };

    await dbDeleteHhPrayer(id);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}
