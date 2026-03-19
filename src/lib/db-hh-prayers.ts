import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

export type HhPrayerRow = {
  id: string;
  name: string;
  sort_order: number;
};

export type HhPrayer = {
  id: string;
  name: string;
  sortOrder: number;
};

export async function dbGetHhPrayers(): Promise<HhPrayer[]> {
  const sb = supabaseAdmin();
  const data = unwrapList<HhPrayerRow>(
    await sb.from("hh_prayers").select("id, name, sort_order").order("sort_order", { ascending: true }),
  );
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    sortOrder: r.sort_order,
  }));
}

export async function dbCreateHhPrayer(name: string, sortOrder: number): Promise<HhPrayer> {
  const sb = supabaseAdmin();
  const data = unwrap<HhPrayerRow>(
    await sb.from("hh_prayers").insert({ name, sort_order: sortOrder }).select("id, name, sort_order").single(),
  );
  return { id: data.id, name: data.name, sortOrder: data.sort_order };
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
