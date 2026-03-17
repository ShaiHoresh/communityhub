import { supabaseAdmin } from "@/lib/supabase-admin";

export type DbLifeEventRow = {
  id: string;
  type: "birth" | "yahrzeit";
  name: string;
  date: Date;
  householdId?: string;
  notes?: string;
  createdAt: Date;
};

function mapRow(r: any): DbLifeEventRow {
  return {
    id: r.id,
    type: r.type,
    name: r.name,
    date: new Date(r.date),
    householdId: r.household_id ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: new Date(r.created_at),
  };
}

export async function dbGetLifeEvents(): Promise<DbLifeEventRow[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("life_events")
    .select("id, type, name, date, household_id, notes, created_at")
    .order("date", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function dbCreateLifeEvent(input: {
  type: "birth" | "yahrzeit";
  name: string;
  date: Date;
  householdId?: string;
  notes?: string;
}): Promise<DbLifeEventRow> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("life_events")
    .insert({
      type: input.type,
      name: input.name,
      date: input.date.toISOString().slice(0, 10),
      household_id: input.householdId ?? null,
      notes: input.notes ?? null,
    })
    .select("id, type, name, date, household_id, notes, created_at")
    .single();
  if (error) throw error;
  return mapRow(data);
}

