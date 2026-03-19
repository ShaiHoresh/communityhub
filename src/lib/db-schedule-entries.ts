import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList, unwrapCount } from "@/lib/supabase-helpers";

export type ScheduleEntryRow = {
  id: string;
  type: string;
  title: string;
  location_id: string;
  hour: number;
  minute: number;
  use_seasonal_mincha_offset: boolean;
  sort_order: number;
  created_at?: string;
};

export type DbScheduleEntry = {
  id: string;
  type: "shacharit" | "mincha" | "arvit" | "lesson";
  title: string;
  locationId: string;
  hour: number;
  minute: number;
  useSeasonalMinchaOffset: boolean;
  sortOrder: number;
};

function mapRow(r: ScheduleEntryRow): DbScheduleEntry {
  return {
    id: r.id,
    type: r.type as DbScheduleEntry["type"],
    title: r.title,
    locationId: r.location_id,
    hour: r.hour,
    minute: r.minute,
    useSeasonalMinchaOffset: !!r.use_seasonal_mincha_offset,
    sortOrder: r.sort_order,
  };
}

export async function dbGetScheduleEntries(): Promise<DbScheduleEntry[]> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("schedule_entries")
    .select("id, type, title, location_id, hour, minute, use_seasonal_mincha_offset, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return unwrapList(result).map(mapRow);
}

export async function dbAddScheduleEntry(input: Omit<DbScheduleEntry, "id">): Promise<DbScheduleEntry> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("schedule_entries")
    .insert({
      type: input.type,
      title: input.title,
      location_id: input.locationId,
      hour: input.hour,
      minute: input.minute,
      use_seasonal_mincha_offset: input.useSeasonalMinchaOffset,
      sort_order: input.sortOrder,
    })
    .select("id, type, title, location_id, hour, minute, use_seasonal_mincha_offset, sort_order")
    .single();
  return mapRow(unwrap(result));
}

export async function dbUpdateScheduleEntry(
  id: string,
  update: Partial<Omit<DbScheduleEntry, "id">>,
): Promise<boolean> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("schedule_entries")
    .update({
      ...(update.type !== undefined ? { type: update.type } : {}),
      ...(update.title !== undefined ? { title: update.title } : {}),
      ...(update.locationId !== undefined ? { location_id: update.locationId } : {}),
      ...(update.hour !== undefined ? { hour: update.hour } : {}),
      ...(update.minute !== undefined ? { minute: update.minute } : {}),
      ...(update.useSeasonalMinchaOffset !== undefined
        ? { use_seasonal_mincha_offset: update.useSeasonalMinchaOffset }
        : {}),
      ...(update.sortOrder !== undefined ? { sort_order: update.sortOrder } : {}),
    })
    .eq("id", id);
  if (error) throw error;
  return true;
}

export async function dbDeleteScheduleEntry(id: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("schedule_entries").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function dbEnsureDefaultScheduleEntries(locationId: string): Promise<void> {
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
      hour: 8,
      minute: 0,
      useSeasonalMinchaOffset: false,
      sortOrder: 0,
    },
    {
      type: "mincha",
      title: "מנחה",
      locationId,
      hour: 18,
      minute: 30,
      useSeasonalMinchaOffset: true,
      sortOrder: 1,
    },
    {
      type: "arvit",
      title: "ערבית",
      locationId,
      hour: 20,
      minute: 0,
      useSeasonalMinchaOffset: false,
      sortOrder: 2,
    },
  ];

  const { error } = await sb.from("schedule_entries").insert(
    defaults.map((d) => ({
      type: d.type,
      title: d.title,
      location_id: d.locationId,
      hour: d.hour,
      minute: d.minute,
      use_seasonal_mincha_offset: d.useSeasonalMinchaOffset,
      sort_order: d.sortOrder,
    })),
  );
  if (error) {
    throw error;
  }
}

