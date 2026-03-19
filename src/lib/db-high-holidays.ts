import { supabaseAdmin } from "@/lib/supabase-admin";

export type HighHolidaySlot = "erev_rh_early" | "erev_rh_late" | "erev_yk_setup";

export type SeatAllocation = {
  prayerId: string;
  menSeats: number;
  womenSeats: number;
};

export type DbHighHolidayRegistration = {
  id: string;
  householdId: string;
  householdName: string;
  committeeInterest: string;
  prepSlot: HighHolidaySlot | null;
  seats: SeatAllocation[];
  createdAt: Date;
};

export async function dbGetHighHolidayRegistrations(): Promise<DbHighHolidayRegistration[]> {
  const sb = supabaseAdmin();
  const { data: regs, error: regErr } = await sb
    .from("high_holiday_registrations")
    .select("id, household_id, household_name, committee_interest, prep_slot, created_at")
    .order("created_at", { ascending: false });
  if (regErr) throw regErr;

  const regIds = (regs ?? []).map((r: any) => r.id);
  const seatsByReg: Record<string, SeatAllocation[]> = {};

  if (regIds.length > 0) {
    const { data: allSeats, error: seatsErr } = await sb
      .from("hh_registration_seats")
      .select("registration_id, prayer_id, men_seats, women_seats")
      .in("registration_id", regIds);
    if (seatsErr) throw seatsErr;
    for (const s of allSeats ?? []) {
      const rid = (s as any).registration_id;
      if (!seatsByReg[rid]) seatsByReg[rid] = [];
      seatsByReg[rid].push({
        prayerId: (s as any).prayer_id,
        menSeats: (s as any).men_seats,
        womenSeats: (s as any).women_seats,
      });
    }
  }

  return (regs ?? []).map((r: any) => ({
    id: r.id,
    householdId: r.household_id,
    householdName: r.household_name ?? "",
    committeeInterest: r.committee_interest ?? "",
    prepSlot: (r.prep_slot as HighHolidaySlot | null) ?? null,
    seats: seatsByReg[r.id] ?? [],
    createdAt: new Date(r.created_at),
  }));
}

export async function dbGetRegistrationForHousehold(
  householdId: string,
): Promise<DbHighHolidayRegistration | null> {
  const sb = supabaseAdmin();
  const { data: reg, error: regErr } = await sb
    .from("high_holiday_registrations")
    .select("id, household_id, household_name, committee_interest, prep_slot, created_at")
    .eq("household_id", householdId)
    .maybeSingle();
  if (regErr) throw regErr;
  if (!reg) return null;

  const { data: seats, error: seatsErr } = await sb
    .from("hh_registration_seats")
    .select("prayer_id, men_seats, women_seats")
    .eq("registration_id", (reg as any).id);
  if (seatsErr) throw seatsErr;

  return {
    id: (reg as any).id,
    householdId: (reg as any).household_id,
    householdName: (reg as any).household_name ?? "",
    committeeInterest: (reg as any).committee_interest ?? "",
    prepSlot: ((reg as any).prep_slot as HighHolidaySlot | null) ?? null,
    seats: (seats ?? []).map((s: any) => ({
      prayerId: s.prayer_id,
      menSeats: s.men_seats,
      womenSeats: s.women_seats,
    })),
    createdAt: new Date((reg as any).created_at),
  };
}

export async function dbGetTotalSeats(): Promise<number> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("hh_registration_seats")
    .select("men_seats, women_seats");
  if (error) throw error;
  return (data ?? []).reduce(
    (sum: number, r: any) => sum + (r.men_seats ?? 0) + (r.women_seats ?? 0),
    0,
  );
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

export async function dbUpsertHighHolidayRegistration(input: {
  householdId: string;
  householdName: string;
  committeeInterest: string;
  prepSlot: HighHolidaySlot | null;
  seats: SeatAllocation[];
}) {
  const sb = supabaseAdmin();

  const { data: reg, error: upsertErr } = await sb
    .from("high_holiday_registrations")
    .upsert(
      {
        household_id: input.householdId,
        household_name: input.householdName,
        committee_interest: input.committeeInterest ?? "",
        prep_slot: input.prepSlot ?? null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "household_id" },
    )
    .select("id")
    .single();
  if (upsertErr) throw upsertErr;

  const registrationId = (reg as any).id as string;

  const { error: delErr } = await sb
    .from("hh_registration_seats")
    .delete()
    .eq("registration_id", registrationId);
  if (delErr) throw delErr;

  const nonZeroSeats = input.seats.filter((s) => s.menSeats > 0 || s.womenSeats > 0);
  if (nonZeroSeats.length > 0) {
    const { error: insErr } = await sb.from("hh_registration_seats").insert(
      nonZeroSeats.map((s) => ({
        registration_id: registrationId,
        prayer_id: s.prayerId,
        men_seats: s.menSeats,
        women_seats: s.womenSeats,
      })),
    );
    if (insErr) throw insErr;
  }

  return { ok: true as const };
}
