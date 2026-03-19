import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

type LifeEventRow = { id: string; type: string; name: string; date: string; household_id: string | null; notes: string | null; created_at: string };

export type DbLifeEventRow = {
  id: string;
  type: "birth" | "yahrzeit";
  name: string;
  date: Date;
  householdId?: string;
  notes?: string;
  createdAt: Date;
};

function mapRow(r: LifeEventRow): DbLifeEventRow {
  return {
    id: r.id,
    type: r.type as "birth" | "yahrzeit",
    name: r.name,
    date: new Date(r.date),
    householdId: r.household_id ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: new Date(r.created_at),
  };
}

export async function dbGetLifeEvents(): Promise<DbLifeEventRow[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(await sb
    .from("life_events")
    .select("id, type, name, date, household_id, notes, created_at")
    .order("date", { ascending: true }));
  return data.map(mapRow);
}

export async function dbCreateLifeEvent(input: {
  type: "birth" | "yahrzeit";
  name: string;
  date: Date;
  householdId?: string;
  notes?: string;
}): Promise<DbLifeEventRow> {
  const sb = supabaseAdmin();
  const data = unwrap(await sb
    .from("life_events")
    .insert({
      type: input.type,
      name: input.name,
      date: input.date.toISOString().slice(0, 10),
      household_id: input.householdId ?? null,
      notes: input.notes ?? null,
    })
    .select("id, type, name, date, household_id, notes, created_at")
    .single());
  return mapRow(data);
}

