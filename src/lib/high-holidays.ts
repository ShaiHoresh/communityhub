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

const registrations: HighHolidayRegistration[] = [];

export function getHighHolidayRegistrations(): HighHolidayRegistration[] {
  return [...registrations];
}

export function getTotalSeats(): number {
  return registrations.reduce((sum, r) => sum + r.seats, 0);
}

export function getUsedForSlot(slot: HighHolidaySlot): number {
  return registrations.filter((r) => r.prepSlot === slot).length;
}

export function getSlotCapacity(slot: HighHolidaySlot): number {
  return CAPACITY_BY_SLOT[slot];
}

export function addHighHolidayRegistration(
  data: Omit<HighHolidayRegistration, "createdAt">
): { ok: true } | { ok: false; error: string } {
  if (data.seats <= 0) {
    return { ok: false, error: "מספר המקומות חייב להיות גדול מאפס." };
  }

  // Optional: very simple global capacity check (e.g. 300 seats overall)
  const TOTAL_CAPACITY = 300;
  if (getTotalSeats() + data.seats > TOTAL_CAPACITY) {
    return { ok: false, error: "אין עוד מקומות זמינים. פנה להנהלת הקהילה." };
  }

  if (data.prepSlot) {
    const used = getUsedForSlot(data.prepSlot);
    const cap = getSlotCapacity(data.prepSlot);
    if (used >= cap) {
      return { ok: false, error: "המשמרת שבחרת מלאה. נסה משבצת אחרת." };
    }
  }

  registrations.push({
    ...data,
    createdAt: new Date(),
  });

  return { ok: true };
}

