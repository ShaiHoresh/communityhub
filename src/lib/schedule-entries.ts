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

const entries: ScheduleEntry[] = [];
let nextOrder = 0;

function nextId(): ScheduleEntryId {
  return `se_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getScheduleEntries(): ScheduleEntry[] {
  return [...entries].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getScheduleEntryById(id: ScheduleEntryId): ScheduleEntry | undefined {
  return entries.find((e) => e.id === id);
}

export function addScheduleEntry(
  data: Omit<ScheduleEntry, "id" | "sortOrder"> & { sortOrder?: number }
): ScheduleEntry {
  const entry: ScheduleEntry = {
    ...data,
    id: nextId(),
    sortOrder: data.sortOrder ?? nextOrder++,
  };
  entries.push(entry);
  return entry;
}

export function updateScheduleEntry(
  id: ScheduleEntryId,
  update: Partial<Omit<ScheduleEntry, "id">>
): boolean {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return false;
  Object.assign(entry, update);
  return true;
}

export function deleteScheduleEntry(id: ScheduleEntryId): boolean {
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  return true;
}

/** Seed default entries when none exist (called from seed or first load). */
export function ensureDefaultScheduleEntries(locationId: string): void {
  if (entries.length > 0) return;
  addScheduleEntry({
    type: "shacharit",
    title: "שחרית",
    locationId,
    hour: 8,
    minute: 0,
    useSeasonalMinchaOffset: false,
    sortOrder: 0,
  });
  addScheduleEntry({
    type: "mincha",
    title: "מנחה",
    locationId,
    hour: 18,
    minute: 30,
    useSeasonalMinchaOffset: true,
    sortOrder: 1,
  });
  addScheduleEntry({
    type: "arvit",
    title: "ערבית",
    locationId,
    hour: 20,
    minute: 0,
    useSeasonalMinchaOffset: false,
    sortOrder: 2,
  });
}
