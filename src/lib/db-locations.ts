import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrapList, unwrapMaybe } from "@/lib/supabase-helpers";
import type { Location } from "@/lib/locations";

export type LocationRow = {
  id: string;
  name: string;
  max_capacity: number;
  space_category: string;
};

function mapRow(r: LocationRow): Location {
  return {
    id: r.id,
    name: r.name,
    maxCapacity: r.max_capacity ?? 0,
    spaceCategory: (r.space_category ?? "Indoor") as Location["spaceCategory"],
  };
}

export async function dbGetLocations(): Promise<Location[]> {
  const sb = supabaseAdmin();
  const result = await sb
    .from("locations")
    .select("id, name, max_capacity, space_category")
    .order("id", { ascending: true });
  return unwrapList(result).map(mapRow);
}

export async function dbGetLocationById(id: string): Promise<Location | undefined> {
  const sb = supabaseAdmin();
  const data = unwrapMaybe(
    await sb
      .from("locations")
      .select("id, name, max_capacity, space_category")
      .eq("id", id)
      .maybeSingle(),
  );
  return data ? mapRow(data) : undefined;
}

export async function dbUpsertLocation(loc: Location): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("locations").upsert(
    {
      id: loc.id,
      name: loc.name,
      max_capacity: loc.maxCapacity,
      space_category: loc.spaceCategory,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function dbDeleteLocation(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("locations").delete().eq("id", id);
  if (error) throw error;
}

export async function dbEnsureLocations(locations: Location[]): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("locations").upsert(
    locations.map((l) => ({
      id: l.id,
      name: l.name,
      max_capacity: l.maxCapacity,
      space_category: l.spaceCategory,
    })),
    { onConflict: "id" },
  );
  if (error) {
    throw error;
  }
}

