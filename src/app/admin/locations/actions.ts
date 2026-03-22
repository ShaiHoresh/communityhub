"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { dbUpsertLocation, dbDeleteLocation } from "@/lib/db-locations";
import type { Location } from "@/lib/locations";
import {
  type ActionResult,
  parseFormString,
  revalidateAdminPaths,
  revalidateAppPaths,
} from "@/lib/action-utils";

const ALLOWED_CATEGORIES = ["Indoor", "Covered", "OpenAir", "Protected"] as const;

function isCategory(v: string): v is Location["spaceCategory"] {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(v);
}

export async function upsertLocationAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = parseFormString(formData, "id");
  const name = parseFormString(formData, "name");
  const capStr = parseFormString(formData, "maxCapacity");
  const spaceCategoryRaw = parseFormString(formData, "spaceCategory");

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

  try {
    await dbUpsertLocation({ id, name, maxCapacity, spaceCategory: spaceCategoryRaw });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה בשמירת מיקום." };
  }

  revalidateAdminPaths();
  revalidateAppPaths();
  return { ok: true };
}

export async function deleteLocationAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await dbDeleteLocation(id);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "שגיאה במחיקת מיקום." };
  }

  revalidateAdminPaths();
  revalidateAppPaths();
  return { ok: true };
}
