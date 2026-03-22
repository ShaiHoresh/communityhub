import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList, unwrapCount } from "@/lib/supabase-helpers";
import type { DayType, Season, TimeType, ZmanKey } from "@/lib/zmanim";

// ── Row types ──────────────────────────────────────────────────────────

export type ScheduleEntryRow = {
  id: string;
  type: string;
  title: string;
  location_id: string;
  day_types: string[];
  specific_date: string | null;
  season: string;
  time_type: string;
  fixed_hour: number | null;
  fixed_minute: number | null;
  zman_key: string | null;
  offset_minutes: number;
  round_to: number;
  sort_order: number;
  created_at?: string;
};

export type ScheduleOverrideRow = {
  id: string;
  schedule_entry_id: string;
  override_date: string;
  is_cancelled: boolean;
  override_hour: number | null;
  override_minute: number | null;
  reason: string | null;
};

// ── Domain types ───────────────────────────────────────────────────────

export type DbScheduleEntry = {
  id: string;
  type: "shacharit" | "mincha" | "arvit" | "lesson";
  title: string;
  locationId: string;
  dayTypes: DayType[];
  specificDate: string | null;
  season: Season;
  timeType: TimeType;
  fixedHour: number | null;
  fixedMinute: number | null;
  zmanKey: ZmanKey | null;
  offsetMinutes: number;
  roundTo: number;
  sortOrder: number;
};

export type DbScheduleOverride = {
  id: string;
  scheduleEntryId: string;
  overrideDate: string;
  isCancelled: boolean;
  overrideHour: number | null;
  overrideMinute: number | null;
  reason: string | null;
};

// ── Mappers ────────────────────────────────────────────────────────────

const ENTRY_SELECT =
  "id, type, title, location_id, day_types, specific_date, season, " +
  "time_type, fixed_hour, fixed_minute, zman_key, offset_minutes, " +
  "round_to, sort_order";

function mapRow(r: ScheduleEntryRow): DbScheduleEntry {
  return {
    id: r.id,
    type: r.type as DbScheduleEntry["type"],
    title: r.title,
    locationId: r.location_id,
    dayTypes: r.day_types as DayType[],
    specificDate: r.specific_date,
    season: (r.season as Season) ?? "always",
    timeType: (r.time_type as TimeType) ?? "FIXED",
    fixedHour: r.fixed_hour,
    fixedMinute: r.fixed_minute,
    zmanKey: r.zman_key as ZmanKey | null,
    offsetMinutes: r.offset_minutes ?? 0,
    roundTo: r.round_to ?? 0,
    sortOrder: r.sort_order,
  };
}

function mapOverride(r: ScheduleOverrideRow): DbScheduleOverride {
  return {
    id: r.id,
    scheduleEntryId: r.schedule_entry_id,
    overrideDate: r.override_date,
    isCancelled: r.is_cancelled,
    overrideHour: r.override_hour,
    overrideMinute: r.override_minute,
    reason: r.reason,
  };
}

// ── Schedule Entry CRUD ────────────────────────────────────────────────

export async function dbGetScheduleEntries(): Promise<DbScheduleEntry[]> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("schedule_entries")
    .select(ENTRY_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (unwrapList(result) as unknown as ScheduleEntryRow[]).map(mapRow);
}

export async function dbAddScheduleEntry(
  input: Omit<DbScheduleEntry, "id">,
): Promise<DbScheduleEntry> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("schedule_entries")
    .insert({
      type: input.type,
      title: input.title,
      location_id: input.locationId,
      day_types: input.dayTypes,
      specific_date: input.specificDate,
      season: input.season,
      time_type: input.timeType,
      fixed_hour: input.fixedHour,
      fixed_minute: input.fixedMinute,
      zman_key: input.zmanKey,
      offset_minutes: input.offsetMinutes,
      round_to: input.roundTo,
      sort_order: input.sortOrder,
    })
    .select(ENTRY_SELECT)
    .single();
  return mapRow(unwrap(result) as unknown as ScheduleEntryRow);
}

export async function dbUpdateScheduleEntry(
  id: string,
  update: Partial<Omit<DbScheduleEntry, "id">>,
): Promise<boolean> {
  const sb = supabaseAdmin();
  const row: Record<string, unknown> = {};
  if (update.type !== undefined) row.type = update.type;
  if (update.title !== undefined) row.title = update.title;
  if (update.locationId !== undefined) row.location_id = update.locationId;
  if (update.dayTypes !== undefined) row.day_types = update.dayTypes;
  if (update.specificDate !== undefined) row.specific_date = update.specificDate;
  if (update.season !== undefined) row.season = update.season;
  if (update.timeType !== undefined) row.time_type = update.timeType;
  if (update.fixedHour !== undefined) row.fixed_hour = update.fixedHour;
  if (update.fixedMinute !== undefined) row.fixed_minute = update.fixedMinute;
  if (update.zmanKey !== undefined) row.zman_key = update.zmanKey;
  if (update.offsetMinutes !== undefined) row.offset_minutes = update.offsetMinutes;
  if (update.roundTo !== undefined) row.round_to = update.roundTo;
  if (update.sortOrder !== undefined) row.sort_order = update.sortOrder;

  const { error } = await sb.from("schedule_entries").update(row).eq("id", id);
  if (error) throw error;
  return true;
}

export async function dbDeleteScheduleEntry(id: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("schedule_entries").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function dbEnsureDefaultScheduleEntries(
  locationId: string,
): Promise<void> {
  const sb = supabaseAdmin();
  const countResult = await sb
    .from("schedule_entries")
    .select("id", { count: "exact", head: true });
  if (unwrapCount(countResult) > 0) return;

  const defaults: Array<Omit<DbScheduleEntry, "id">> = [
    {
      type: "shacharit",
      title: "שחרית",
      locationId,
      dayTypes: ["weekday", "shabbat"],
      specificDate: null,
      season: "always",
      timeType: "FIXED",
      fixedHour: 8,
      fixedMinute: 0,
      zmanKey: null,
      offsetMinutes: 0,
      roundTo: 0,
      sortOrder: 0,
    },
    {
      type: "mincha",
      title: "מנחה",
      locationId,
      dayTypes: ["weekday", "shabbat"],
      specificDate: null,
      season: "always",
      timeType: "DYNAMIC_OFFSET",
      fixedHour: null,
      fixedMinute: null,
      zmanKey: "sunset",
      offsetMinutes: -20,
      roundTo: 5,
      sortOrder: 1,
    },
    {
      type: "arvit",
      title: "ערבית",
      locationId,
      dayTypes: ["weekday", "shabbat"],
      specificDate: null,
      season: "always",
      timeType: "FIXED",
      fixedHour: 20,
      fixedMinute: 0,
      zmanKey: null,
      offsetMinutes: 0,
      roundTo: 0,
      sortOrder: 2,
    },
  ];

  const { error } = await sb.from("schedule_entries").insert(
    defaults.map((d) => ({
      type: d.type,
      title: d.title,
      location_id: d.locationId,
      day_types: d.dayTypes,
      specific_date: d.specificDate,
      season: d.season,
      time_type: d.timeType,
      fixed_hour: d.fixedHour,
      fixed_minute: d.fixedMinute,
      zman_key: d.zmanKey,
      offset_minutes: d.offsetMinutes,
      round_to: d.roundTo,
      sort_order: d.sortOrder,
    })),
  );
  if (error) throw error;
}

// ── Override CRUD ──────────────────────────────────────────────────────

export async function dbGetOverridesForDate(
  dateStr: string,
): Promise<DbScheduleOverride[]> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("schedule_overrides")
    .select("id, schedule_entry_id, override_date, is_cancelled, override_hour, override_minute, reason")
    .eq("override_date", dateStr);
  return (unwrapList(result) as unknown as ScheduleOverrideRow[]).map(mapOverride);
}

export async function dbGetOverridesForEntry(
  entryId: string,
): Promise<DbScheduleOverride[]> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("schedule_overrides")
    .select("id, schedule_entry_id, override_date, is_cancelled, override_hour, override_minute, reason")
    .eq("schedule_entry_id", entryId)
    .order("override_date", { ascending: true });
  return (unwrapList(result) as unknown as ScheduleOverrideRow[]).map(mapOverride);
}

export async function dbUpsertOverride(input: {
  scheduleEntryId: string;
  overrideDate: string;
  isCancelled: boolean;
  overrideHour: number | null;
  overrideMinute: number | null;
  reason: string | null;
}): Promise<DbScheduleOverride> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("schedule_overrides")
    .upsert(
      {
        schedule_entry_id: input.scheduleEntryId,
        override_date: input.overrideDate,
        is_cancelled: input.isCancelled,
        override_hour: input.overrideHour,
        override_minute: input.overrideMinute,
        reason: input.reason,
      },
      { onConflict: "schedule_entry_id,override_date" },
    )
    .select("id, schedule_entry_id, override_date, is_cancelled, override_hour, override_minute, reason")
    .single();
  return mapOverride(unwrap(result) as unknown as ScheduleOverrideRow);
}

export async function dbDeleteOverride(id: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("schedule_overrides").delete().eq("id", id);
  if (error) throw error;
  return true;
}
