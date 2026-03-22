"use server";

import {
  addScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
  ensureDefaultScheduleEntries,
  type ScheduleEntryType,
} from "@/lib/schedule-entries";
import { getLocations } from "@/lib/locations";
import { dbEnsureLocations } from "@/lib/db-locations";
import { requireAdmin } from "@/lib/auth-guard";
import {
  type ActionResult,
  parseFormString,
  parseFormInt,
  revalidateAdminPaths,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

export async function addEntryAction(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const type = parseFormString(formData, "type") as ScheduleEntryType;
    const title = parseFormString(formData, "title");
    const locationId = parseFormString(formData, "locationId");
    const hour = parseFormInt(formData, "hour", -1);
    const minute = parseFormInt(formData, "minute", -1);
    const useSeasonalMinchaOffset =
      formData.get("useSeasonalMinchaOffset") === "on";

    if (!title || !locationId || hour < 0 || minute < 0) {
      return { ok: false, error: "נא למלא שדות חובה." };
    }
    if (hour > 23 || minute > 59) {
      return { ok: false, error: "שעה לא חוקית." };
    }

    await dbEnsureLocations(await getLocations());
    await addScheduleEntry({
      type,
      title,
      locationId,
      hour,
      minute,
      useSeasonalMinchaOffset: type === "mincha" && useSeasonalMinchaOffset,
    });
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function updateEntryAction(
  entryId: string,
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const type = parseFormString(formData, "type") as ScheduleEntryType;
    const title = parseFormString(formData, "title");
    const locationId = parseFormString(formData, "locationId");
    const hour = parseFormInt(formData, "hour", -1);
    const minute = parseFormInt(formData, "minute", -1);
    const useSeasonalMinchaOffset =
      formData.get("useSeasonalMinchaOffset") === "on";

    if (!title || !locationId || hour < 0 || minute < 0) {
      return { ok: false, error: "נא למלא שדות חובה." };
    }

    const updated = await updateScheduleEntry(entryId, {
      type,
      title,
      locationId,
      hour,
      minute,
      useSeasonalMinchaOffset: type === "mincha" && useSeasonalMinchaOffset,
    });
    revalidateAdminPaths();
    revalidateAppPaths();
    return updated ? { ok: true } : { ok: false, error: "לא נמצא." };
  });
}

export async function deleteEntryAction(
  entryId: string,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const deleted = await deleteScheduleEntry(entryId);
    revalidateAdminPaths();
    revalidateAppPaths();
    return deleted ? { ok: true } : { ok: false, error: "לא נמצא." };
  });
}

export async function seedDefaultScheduleAction(): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const resolved = await getLocations();
    const resolvedMainId = resolved[0]?.id;
    if (!resolvedMainId) return { ok: false, error: "אין מיקומים." };
    await dbEnsureLocations(resolved);
    await ensureDefaultScheduleEntries(resolvedMainId);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}
