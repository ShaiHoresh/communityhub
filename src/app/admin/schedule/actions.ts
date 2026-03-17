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
import { revalidatePath } from "next/cache";

export async function addEntryAction(formData: FormData) {
  const type = formData.get("type") as ScheduleEntryType;
  const title = (formData.get("title") as string)?.trim();
  const locationId = formData.get("locationId") as string;
  const hour = parseInt(formData.get("hour") as string, 10);
  const minute = parseInt(formData.get("minute") as string, 10);
  const useSeasonalMinchaOffset = formData.get("useSeasonalMinchaOffset") === "on";

  if (!title || !locationId || isNaN(hour) || isNaN(minute)) {
    return { ok: false, error: "נא למלא שדות חובה." };
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { ok: false, error: "שעה לא חוקית." };
  }

  await dbEnsureLocations(getLocations());

  await addScheduleEntry({
    type,
    title,
    locationId,
    hour,
    minute,
    useSeasonalMinchaOffset: type === "mincha" && useSeasonalMinchaOffset,
  });
  revalidatePath("/admin/schedule");
  revalidatePath("/");
  return { ok: true };
}

export async function updateEntryAction(entryId: string, formData: FormData) {
  const type = formData.get("type") as ScheduleEntryType;
  const title = (formData.get("title") as string)?.trim();
  const locationId = formData.get("locationId") as string;
  const hour = parseInt(formData.get("hour") as string, 10);
  const minute = parseInt(formData.get("minute") as string, 10);
  const useSeasonalMinchaOffset = formData.get("useSeasonalMinchaOffset") === "on";

  if (!title || !locationId || isNaN(hour) || isNaN(minute)) {
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
  revalidatePath("/admin/schedule");
  revalidatePath("/");
  return updated ? { ok: true } : { ok: false, error: "לא נמצא." };
}

export async function deleteEntryAction(entryId: string) {
  const deleted = await deleteScheduleEntry(entryId);
  revalidatePath("/admin/schedule");
  revalidatePath("/");
  return deleted ? { ok: true } : { ok: false, error: "לא נמצא." };
}

export async function seedDefaultScheduleAction() {
  const locations = getLocations();
  const mainId = locations[0]?.id;
  if (!mainId) return { ok: false, error: "אין מיקומים." };
  await dbEnsureLocations(locations);
  await ensureDefaultScheduleEntries(mainId);
  revalidatePath("/admin/schedule");
  revalidatePath("/");
  return { ok: true };
}
