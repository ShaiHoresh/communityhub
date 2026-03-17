/**
 * Admin-configurable schedule entry templates (prayers and lessons).
 * buildDailyScheduleForDate uses these to build the daily events.
 */

export type ScheduleEntryType = "shacharit" | "mincha" | "arvit" | "lesson";

export type ScheduleEntryId = string;

export type ScheduleEntry = {
  id: ScheduleEntryId;
  type: ScheduleEntryType;
  title: string;
  locationId: string;
  hour: number; // 0–23
  minute: number; // 0–59
  /** If true (mincha only), apply seasonal offset (15-min increments). */
  useSeasonalMinchaOffset: boolean;
  sortOrder: number;
};

import {
  dbAddScheduleEntry,
  dbDeleteScheduleEntry,
  dbEnsureDefaultScheduleEntries,
  dbGetScheduleEntries,
  dbUpdateScheduleEntry,
} from "@/lib/db-schedule-entries";

export async function getScheduleEntries(): Promise<ScheduleEntry[]> {
  return dbGetScheduleEntries();
}

export async function addScheduleEntry(
  data: Omit<ScheduleEntry, "id" | "sortOrder"> & { sortOrder?: number },
): Promise<ScheduleEntry> {
  const current = await dbGetScheduleEntries();
  const nextOrder = data.sortOrder ?? (current.length ? Math.max(...current.map((e) => e.sortOrder)) + 1 : 0);
  return dbAddScheduleEntry({
    type: data.type,
    title: data.title,
    locationId: data.locationId,
    hour: data.hour,
    minute: data.minute,
    useSeasonalMinchaOffset: data.useSeasonalMinchaOffset,
    sortOrder: nextOrder,
  });
}

export async function updateScheduleEntry(
  id: ScheduleEntryId,
  update: Partial<Omit<ScheduleEntry, "id">>,
): Promise<boolean> {
  await dbUpdateScheduleEntry(id, update);
  return true;
}

export async function deleteScheduleEntry(id: ScheduleEntryId): Promise<boolean> {
  await dbDeleteScheduleEntry(id);
  return true;
}

/** Seed default entries when none exist (called from seed or first load). */
export async function ensureDefaultScheduleEntries(locationId: string): Promise<void> {
  await dbEnsureDefaultScheduleEntries(locationId);
}
