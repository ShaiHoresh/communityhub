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
import { dbUpsertOverride, dbDeleteOverride } from "@/lib/db-schedule-entries";
import { requireAdmin } from "@/lib/auth-guard";
import {
  type ActionResult,
  parseFormString,
  parseFormInt,
  revalidateAdminPaths,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";
import type { DayType, Season, TimeType, ZmanKey } from "@/lib/zmanim";
import { DAY_TYPES, SEASONS, TIME_TYPES, ZMAN_KEYS } from "@/lib/zmanim";

function parseDayTypes(formData: FormData): DayType[] {
  const raw = formData.getAll("dayTypes") as string[];
  return raw.filter((v) => (DAY_TYPES as readonly string[]).includes(v)) as DayType[];
}

export async function addEntryAction(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const type = parseFormString(formData, "type") as ScheduleEntryType;
    const title = parseFormString(formData, "title");
    const locationId = parseFormString(formData, "locationId");
    const dayTypes = parseDayTypes(formData);
    const specificDateRaw = parseFormString(formData, "specificDate");
    const season = parseFormString(formData, "season") as Season;
    const timeType = parseFormString(formData, "timeType") as TimeType;
    const fixedHour = parseFormInt(formData, "fixedHour", -1);
    const fixedMinute = parseFormInt(formData, "fixedMinute", -1);
    const zmanKeyRaw = parseFormString(formData, "zmanKey");
    const offsetMinutes = parseFormInt(formData, "offsetMinutes", 0);
    const roundTo = parseFormInt(formData, "roundTo", 0);

    if (!title || !locationId) {
      return { ok: false, error: "נא למלא כותרת ומיקום." };
    }
    if (dayTypes.length === 0) {
      return { ok: false, error: "נא לבחור לפחות סוג יום אחד." };
    }
    if (!(SEASONS as readonly string[]).includes(season)) {
      return { ok: false, error: "עונה לא תקינה." };
    }
    if (!(TIME_TYPES as readonly string[]).includes(timeType)) {
      return { ok: false, error: "סוג שעה לא תקין." };
    }

    if (timeType === "FIXED") {
      if (fixedHour < 0 || fixedHour > 23 || fixedMinute < 0 || fixedMinute > 59) {
        return { ok: false, error: "שעה קבועה לא חוקית." };
      }
    }

    const zmanKey =
      (timeType === "ZMANIM_BASED" || timeType === "DYNAMIC_OFFSET") &&
      (ZMAN_KEYS as readonly string[]).includes(zmanKeyRaw)
        ? (zmanKeyRaw as ZmanKey)
        : null;

    if ((timeType === "ZMANIM_BASED" || timeType === "DYNAMIC_OFFSET") && !zmanKey) {
      return { ok: false, error: "נא לבחור זמן הלכתי." };
    }

    await dbEnsureLocations(await getLocations());
    await addScheduleEntry({
      type,
      title,
      locationId,
      dayTypes,
      specificDate: specificDateRaw || null,
      season,
      timeType,
      fixedHour: timeType === "FIXED" ? fixedHour : null,
      fixedMinute: timeType === "FIXED" ? fixedMinute : null,
      zmanKey,
      offsetMinutes: timeType === "DYNAMIC_OFFSET" ? offsetMinutes : 0,
      roundTo,
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
    const dayTypes = parseDayTypes(formData);
    const specificDateRaw = parseFormString(formData, "specificDate");
    const season = parseFormString(formData, "season") as Season;
    const timeType = parseFormString(formData, "timeType") as TimeType;
    const fixedHour = parseFormInt(formData, "fixedHour", -1);
    const fixedMinute = parseFormInt(formData, "fixedMinute", -1);
    const zmanKeyRaw = parseFormString(formData, "zmanKey");
    const offsetMinutes = parseFormInt(formData, "offsetMinutes", 0);
    const roundTo = parseFormInt(formData, "roundTo", 0);

    if (!title || !locationId || dayTypes.length === 0) {
      return { ok: false, error: "נא למלא שדות חובה." };
    }

    const zmanKey =
      (timeType === "ZMANIM_BASED" || timeType === "DYNAMIC_OFFSET") &&
      (ZMAN_KEYS as readonly string[]).includes(zmanKeyRaw)
        ? (zmanKeyRaw as ZmanKey)
        : null;

    const updated = await updateScheduleEntry(entryId, {
      type,
      title,
      locationId,
      dayTypes,
      specificDate: specificDateRaw || null,
      season,
      timeType,
      fixedHour: timeType === "FIXED" ? fixedHour : null,
      fixedMinute: timeType === "FIXED" ? fixedMinute : null,
      zmanKey,
      offsetMinutes: timeType === "DYNAMIC_OFFSET" ? offsetMinutes : 0,
      roundTo,
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

export async function upsertOverrideAction(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const entryId = parseFormString(formData, "scheduleEntryId");
    const overrideDate = parseFormString(formData, "overrideDate");
    const isCancelled = formData.get("isCancelled") === "on";
    const overrideHour = parseFormInt(formData, "overrideHour", -1);
    const overrideMinute = parseFormInt(formData, "overrideMinute", -1);
    const reason = parseFormString(formData, "reason");

    if (!entryId || !overrideDate) {
      return { ok: false, error: "נא למלא שדות חובה." };
    }

    await dbUpsertOverride({
      scheduleEntryId: entryId,
      overrideDate,
      isCancelled,
      overrideHour: isCancelled ? null : overrideHour >= 0 ? overrideHour : null,
      overrideMinute: isCancelled ? null : overrideMinute >= 0 ? overrideMinute : null,
      reason: reason || null,
    });
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function deleteOverrideAction(
  overrideId: string,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbDeleteOverride(overrideId);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}
