export type HighHolidaySlot = "erev_rh_early" | "erev_rh_late" | "erev_yk_setup";

export type HighHolidayRegistration = {
  userId: string;
  fullName: string;
  householdName?: string;
  seats: number;
  committeeInterest: string; // free text summary
  prepSlot: HighHolidaySlot | null;
  createdAt: Date;
};

const CAPACITY_BY_SLOT: Record<HighHolidaySlot, number> = {
  erev_rh_early: 120,
  erev_rh_late: 120,
  erev_yk_setup: 40,
};

import {
  dbGetHighHolidayRegistrations,
  dbGetTotalSeats,
  dbGetUsedForSlot,
  dbUpsertHighHolidayRegistration,
} from "@/lib/db-high-holidays";

export async function getHighHolidayRegistrations(): Promise<HighHolidayRegistration[]> {
  return dbGetHighHolidayRegistrations();
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

export function addHighHolidayRegistration(
  data: Omit<HighHolidayRegistration, "createdAt">
): Promise<{ ok: true } | { ok: false; error: string }> {
  return (async () => {
    if (data.seats <= 0) {
      return { ok: false, error: "מספר המקומות חייב להיות גדול מאפס." };
    }

    // Optional: very simple global capacity check (e.g. 300 seats overall)
    const TOTAL_CAPACITY = 300;
    // Note: in Supabase mode this is not race-safe; acceptable for now.
    // If needed we can implement a DB-side function/transaction.
    if ((await getTotalSeats()) + data.seats > TOTAL_CAPACITY) {
      return { ok: false, error: "אין עוד מקומות זמינים. פנה להנהלת הקהילה." };
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
  })();
}

