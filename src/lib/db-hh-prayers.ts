import { supabaseAdmin } from "@/lib/supabase-admin";

export type HhPrayer = {
  id: string;
  name: string;
  sortOrder: number;
};

export async function dbGetHhPrayers(): Promise<HhPrayer[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("hh_prayers")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    sortOrder: r.sort_order,
  }));
}

export async function dbCreateHhPrayer(name: string, sortOrder: number): Promise<HhPrayer> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("hh_prayers")
    .insert({ name, sort_order: sortOrder })
    .select("id, name, sort_order")
    .single();
  if (error) throw error;
  return { id: (data as any).id, name: (data as any).name, sortOrder: (data as any).sort_order };
}

export async function dbUpdateHhPrayer(id: string, name: string, sortOrder: number): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("hh_prayers")
    .update({ name, sort_order: sortOrder })
    .eq("id", id);
  if (error) throw error;
}

export async function dbDeleteHhPrayer(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("hh_prayers").delete().eq("id", id);
  if (error) throw error;
}
