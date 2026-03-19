import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapCount, unwrapList, unwrapMaybe } from "@/lib/supabase-helpers";

export type HighHolidaySlot = "erev_rh_early" | "erev_rh_late" | "erev_yk_setup";

export type RegistrationRow = {
  id: string;
  household_id: string;
  household_name: string | null;
  committee_interest: string | null;
  prep_slot: string | null;
  created_at: string;
};

export type SeatRow = {
  registration_id: string;
  prayer_id: string;
  men_seats: number;
  women_seats: number;
};

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
  const regs = unwrapList<RegistrationRow>(
    await sb
      .from("high_holiday_registrations")
      .select("id, household_id, household_name, committee_interest, prep_slot, created_at")
      .order("created_at", { ascending: false }),
  );

  const regIds = regs.map((r) => r.id);
  const seatsByReg: Record<string, SeatAllocation[]> = {};

  if (regIds.length > 0) {
    const allSeats = unwrapList<SeatRow>(
      await sb.from("hh_registration_seats").select("registration_id, prayer_id, men_seats, women_seats").in("registration_id", regIds),
    );
    for (const s of allSeats) {
      const rid = s.registration_id;
      if (!seatsByReg[rid]) seatsByReg[rid] = [];
      seatsByReg[rid].push({
        prayerId: s.prayer_id,
        menSeats: s.men_seats,
        womenSeats: s.women_seats,
      });
    }
  }

  return regs.map((r) => ({
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
  const reg = unwrapMaybe<RegistrationRow>(
    await sb
      .from("high_holiday_registrations")
      .select("id, household_id, household_name, committee_interest, prep_slot, created_at")
      .eq("household_id", householdId)
      .maybeSingle(),
  );
  if (!reg) return null;

  const seats = unwrapList<Pick<SeatRow, "prayer_id" | "men_seats" | "women_seats">>(
    await sb.from("hh_registration_seats").select("prayer_id, men_seats, women_seats").eq("registration_id", reg.id),
  );

  return {
    id: reg.id,
    householdId: reg.household_id,
    householdName: reg.household_name ?? "",
    committeeInterest: reg.committee_interest ?? "",
    prepSlot: (reg.prep_slot as HighHolidaySlot | null) ?? null,
    seats: seats.map((s) => ({
      prayerId: s.prayer_id,
      menSeats: s.men_seats,
      womenSeats: s.women_seats,
    })),
    createdAt: new Date(reg.created_at),
  };
}

export async function dbGetTotalSeats(): Promise<number> {
  const sb = supabaseAdmin();
  const data = unwrapList<Pick<SeatRow, "men_seats" | "women_seats">>(
    await sb.from("hh_registration_seats").select("men_seats, women_seats"),
  );
  return data.reduce((sum, r) => sum + (r.men_seats ?? 0) + (r.women_seats ?? 0), 0);
}

export async function dbGetUsedForSlot(slot: HighHolidaySlot): Promise<number> {
  const sb = supabaseAdmin();
  return unwrapCount(
    await sb
      .from("high_holiday_registrations")
      .select("household_id", { count: "exact", head: true })
      .eq("prep_slot", slot),
  );
}

export async function dbUpsertHighHolidayRegistration(input: {
  householdId: string;
  householdName: string;
  committeeInterest: string;
  prepSlot: HighHolidaySlot | null;
  seats: SeatAllocation[];
}) {
  const sb = supabaseAdmin();

  const reg = unwrap<Pick<RegistrationRow, "id">>(
    await sb
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
      .single(),
  );

  const registrationId = reg.id;

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
