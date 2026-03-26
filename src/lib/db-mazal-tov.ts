import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

const EVENT_TYPES = ["birth", "bar_mitzvah", "bat_mitzvah", "wedding", "anniversary", "other"] as const;
export type MazalTovEventType = (typeof EVENT_TYPES)[number];

export const MAZAL_TOV_EVENT_LABELS: Record<MazalTovEventType, string> = {
  birth: "לידה",
  bar_mitzvah: "בר מצווה",
  bat_mitzvah: "בת מצווה",
  wedding: "חתונה",
  anniversary: "יום נישואין",
  other: "אחר",
};

type MazalTovRow = {
  id: string;
  event_type: string;
  name: string;
  message: string | null;
  date: string;
  created_at: string;
};

export type DbMazalTov = {
  id: string;
  eventType: MazalTovEventType;
  name: string;
  message?: string;
  date: Date;
  createdAt: Date;
};

function mapRow(r: MazalTovRow): DbMazalTov {
  return {
    id: r.id,
    eventType: (EVENT_TYPES.includes(r.event_type as MazalTovEventType)
      ? r.event_type
      : "other") as MazalTovEventType,
    name: r.name,
    message: r.message ?? undefined,
    date: new Date(r.date),
    createdAt: new Date(r.created_at),
  };
}

const SELECT = "id, event_type, name, message, date, created_at";

/** Returns entries within the last `days` days, ordered newest first. */
export async function dbGetMazalTovRecent(days = 30): Promise<DbMazalTov[]> {
  const sb = supabaseAdmin();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const data = unwrapList(
    await sb
      .from("mazal_tov")
      .select(SELECT)
      .gte("date", since.toISOString().slice(0, 10))
      .order("date", { ascending: false }),
  );
  return data.map(mapRow);
}

/** Returns all entries ordered newest first (for admin). */
export async function dbGetAllMazalTov(): Promise<DbMazalTov[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(
    await sb.from("mazal_tov").select(SELECT).order("date", { ascending: false }),
  );
  return data.map(mapRow);
}

export async function dbAddMazalTov(input: {
  eventType: MazalTovEventType;
  name: string;
  message?: string;
  date: string;
}): Promise<DbMazalTov> {
  const sb = supabaseAdmin();
  const data = unwrap(
    await sb
      .from("mazal_tov")
      .insert({
        event_type: input.eventType,
        name: input.name,
        message: input.message ?? null,
        date: input.date,
      })
      .select(SELECT)
      .single(),
  );
  return mapRow(data as MazalTovRow);
}

export async function dbDeleteMazalTov(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("mazal_tov").delete().eq("id", id);
  if (error) throw error;
}
