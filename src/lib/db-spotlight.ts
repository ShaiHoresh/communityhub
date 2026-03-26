import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

type SpotlightRow = {
  id: string;
  household_id: string;
  bio: string;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  // Supabase returns related rows as an array even for a single FK join
  households?: { name: string }[] | { name: string } | null;
};

export type DbSpotlight = {
  id: string;
  householdId: string;
  householdName?: string;
  bio: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: Date;
};

function mapRow(r: SpotlightRow): DbSpotlight {
  const hh = Array.isArray(r.households) ? r.households[0] : r.households;
  return {
    id: r.id,
    householdId: r.household_id,
    householdName: hh?.name,
    bio: r.bio,
    photoUrl: r.photo_url ?? undefined,
    isActive: !!r.is_active,
    createdAt: new Date(r.created_at),
  };
}

const SELECT = "id, household_id, bio, photo_url, is_active, created_at, households(name)";

/** Returns the single currently active spotlight (for homepage). */
export async function dbGetActiveSpotlight(): Promise<DbSpotlight | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("meet_the_family")
    .select(SELECT)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as unknown as SpotlightRow) : null;
}

/** Returns all spotlights for the admin view. */
export async function dbGetAllSpotlights(): Promise<DbSpotlight[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(
    await sb
      .from("meet_the_family")
      .select(SELECT)
      .order("is_active", { ascending: false })
      .order("created_at", { ascending: false }),
  );
  return data.map((r) => mapRow(r as unknown as SpotlightRow));
}

export async function dbAddSpotlight(input: {
  householdId: string;
  bio: string;
  photoUrl?: string;
}): Promise<DbSpotlight> {
  const sb = supabaseAdmin();
  const data = unwrap(
    await sb
      .from("meet_the_family")
      .insert({
        household_id: input.householdId,
        bio: input.bio,
        photo_url: input.photoUrl ?? null,
        is_active: false,
      })
      .select(SELECT)
      .single(),
  );
  return mapRow(data as unknown as SpotlightRow);
}

/**
 * Sets one spotlight as active and deactivates all others.
 * Passing null deactivates all (clears spotlight).
 */
export async function dbSetActiveSpotlight(id: string | null): Promise<void> {
  const sb = supabaseAdmin();
  // Deactivate all first
  const { error: errAll } = await sb
    .from("meet_the_family")
    .update({ is_active: false })
    .neq("id", id ?? "");
  if (errAll) throw errAll;
  // Activate the chosen one
  if (id) {
    const { error } = await sb
      .from("meet_the_family")
      .update({ is_active: true })
      .eq("id", id);
    if (error) throw error;
  }
}

export async function dbDeleteSpotlight(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("meet_the_family").delete().eq("id", id);
  if (error) throw error;
}
