import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Location } from "@/lib/locations";

export async function dbEnsureLocations(locations: Location[]): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("locations").upsert(
    locations.map((l) => ({ id: l.id, name: l.name, max_capacity: l.maxCapacity })),
    { onConflict: "id" },
  );
  if (error) throw error;
}

