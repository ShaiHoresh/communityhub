export type { HighHolidaySlot, SeatAllocation } from "@/lib/db-high-holidays";
import type { HighHolidaySlot, SeatAllocation } from "@/lib/db-high-holidays";

export type HighHolidayRegistration = {
  id: string;
  householdId: string;
  householdName: string;
  committeeInterest: string;
  prepSlot: HighHolidaySlot | null;
  seats: SeatAllocation[];
  createdAt: Date;
};

import {
  dbGetHighHolidayRegistrations,
  dbGetRegistrationForHousehold,
  dbGetTotalSeats,
  dbGetUsedForSlot,
  dbUpsertHighHolidayRegistration,
} from "@/lib/db-high-holidays";

const CAPACITY_BY_SLOT: Record<HighHolidaySlot, number> = {
  erev_rh_early: 120,
  erev_rh_late: 120,
  erev_yk_setup: 40,
};

export async function getHighHolidayRegistrations(): Promise<HighHolidayRegistration[]> {
  return dbGetHighHolidayRegistrations();
}

export async function getRegistrationForHousehold(
  householdId: string,
): Promise<HighHolidayRegistration | null> {
  return dbGetRegistrationForHousehold(householdId);
}

export async function getTotalSeats(): Promise<number> {
  return dbGetTotalSeats();
}

export async function getUsedForSlot(slot: HighHolidaySlot): Promise<number> {
  return dbGetUsedForSlot(slot);
}

export function getSlotCapacity(slot: HighHolidaySlot): number {
  return CAPACITY_BY_SLOT[slot];
}

export async function addHighHolidayRegistration(
  data: Omit<HighHolidayRegistration, "id" | "createdAt">,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const totalNewSeats = data.seats.reduce(
    (sum, s) => sum + s.menSeats + s.womenSeats,
    0,
  );
  if (totalNewSeats <= 0) {
    return { ok: false, error: "יש לבקש לפחות מקום אחד." };
  }

  if (data.prepSlot) {
    const used = await getUsedForSlot(data.prepSlot);
    const cap = getSlotCapacity(data.prepSlot);
    if (used >= cap) {
      return { ok: false, error: "המשמרת שבחרת מלאה. נסה משבצת אחרת." };
    }
  }

  await dbUpsertHighHolidayRegistration(data);
  return { ok: true };
}
