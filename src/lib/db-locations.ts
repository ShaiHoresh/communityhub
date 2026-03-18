import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Location } from "@/lib/locations";

export async function dbGetLocations(): Promise<Location[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("locations")
    .select("id, name, max_capacity")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    maxCapacity: r.max_capacity ?? 0,
  }));
}

export async function dbGetLocationById(id: string): Promise<Location | undefined> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("locations")
    .select("id, name, max_capacity")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return {
    id: (data as any).id,
    name: (data as any).name,
    maxCapacity: (data as any).max_capacity ?? 0,
  };
}

export async function dbEnsureLocations(locations: Location[]): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("locations").upsert(
    locations.map((l) => ({ id: l.id, name: l.name, max_capacity: l.maxCapacity })),
    { onConflict: "id" },
  );
  if (error) {
    throw error;
  }
}

