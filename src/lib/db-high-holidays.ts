import { supabaseAdmin } from "@/lib/supabase-admin";

export type HighHolidaySlot = "erev_rh_early" | "erev_rh_late" | "erev_yk_setup";

export type DbHighHolidayRegistration = {
  householdId: string;
  householdName: string;
  seats: number;
  committeeInterest: string;
  prepSlot: HighHolidaySlot | null;
  createdAt: Date;
};

function mapRow(r: any): DbHighHolidayRegistration {
  return {
    householdId: r.household_id,
    householdName: r.household_name ?? "",
    seats: r.seats,
    committeeInterest: r.committee_interest ?? "",
    prepSlot: (r.prep_slot as HighHolidaySlot | null) ?? null,
    createdAt: new Date(r.created_at),
  };
}

export async function dbGetHighHolidayRegistrations(): Promise<DbHighHolidayRegistration[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("high_holiday_registrations")
    .select("household_id, household_name, seats, committee_interest, prep_slot, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function dbGetTotalSeats(): Promise<number> {
  const regs = await dbGetHighHolidayRegistrations();
  return regs.reduce((sum, r) => sum + r.seats, 0);
}

export async function dbGetUsedForSlot(slot: HighHolidaySlot): Promise<number> {
  const sb = supabaseAdmin();
  const { count, error } = await sb
    .from("high_holiday_registrations")
    .select("household_id", { count: "exact", head: true })
    .eq("prep_slot", slot);
  if (error) throw error;
  return count ?? 0;
}

export async function dbUpsertHighHolidayRegistration(input: Omit<DbHighHolidayRegistration, "createdAt">) {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("high_holiday_registrations")
    .upsert(
      {
        household_id: input.householdId,
        household_name: input.householdName,
        seats: input.seats,
        committee_interest: input.committeeInterest ?? "",
        prep_slot: input.prepSlot ?? null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "household_id" },
    );
  if (error) throw error;
  return { ok: true as const };
}
