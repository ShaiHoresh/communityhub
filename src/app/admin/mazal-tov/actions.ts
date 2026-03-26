"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { dbAddMazalTov, dbDeleteMazalTov, type MazalTovEventType } from "@/lib/db-mazal-tov";
import {
  type ActionResult,
  parseFormString,
  revalidateAdminPaths,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

const VALID_TYPES = ["birth", "bar_mitzvah", "bat_mitzvah", "wedding", "anniversary", "other"];

export async function addMazalTovAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const eventType = parseFormString(formData, "eventType");
    const name = parseFormString(formData, "name");
    const message = parseFormString(formData, "message");
    const date = parseFormString(formData, "date");

    if (!eventType || !VALID_TYPES.includes(eventType))
      return { ok: false, error: "סוג אירוע לא תקין." };
    if (!name) return { ok: false, error: "שם הוא שדה חובה." };
    if (!date) return { ok: false, error: "תאריך הוא שדה חובה." };

    await dbAddMazalTov({
      eventType: eventType as MazalTovEventType,
      name,
      message: message || undefined,
      date,
    });
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function deleteMazalTovAction(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbDeleteMazalTov(id);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}
