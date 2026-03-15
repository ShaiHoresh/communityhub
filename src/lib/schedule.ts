import { extractShabbatTimes, fetchHebcalShabbatForDate } from "@/lib/hebcal";
import type { Location } from "@/lib/locations";

export type PrayerType = "shacharit" | "mincha" | "arvit";

export type PrayerEvent = {
  id: string;
  title: string;
  type: PrayerType;
  start: Date;
  location: Location;
};

export type DailySchedule = {
  date: Date;
  events: PrayerEvent[];
};

// Seasonal Shift Logic for Shabbat Mincha:
// As a first version, we model Mincha time as shifting in 15-minute increments
// depending on the part of the civil year.
export function getSeasonalShabbatMinchaOffsetMinutes(date: Date): number {
  const month = date.getMonth(); // 0-based

  // Very simple approximation:
  // - Winter (Dec–Feb): earlier Mincha
  // - Transition (Mar–Apr, Sep–Oct): middle offsets
  // - Summer (May–Aug): later Mincha
  if (month === 11 || month <= 1) {
    // Dec–Feb
    return -15;
  }

  if (month === 2 || month === 3 || month === 8 || month === 9) {
    // Mar–Apr, Sep–Oct
    return 0;
  }

  // May–Aug
  return 15;
}

export async function buildDailyScheduleForDate(
  date: Date,
  mainLocation: Location,
): Promise<DailySchedule> {
  const hebcal = await fetchHebcalShabbatForDate(date);
  const { candles, havdalah } = extractShabbatTimes(hebcal.items);

  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  const events: PrayerEvent[] = [];

  // Example fixed Shacharit and Arvit. In a real system these would be configurable.
  const shacharit = new Date(baseDate);
  shacharit.setHours(8, 0, 0, 0);

  const arvit = new Date(baseDate);
  arvit.setHours(20, 0, 0, 0);

  const minchaBase = new Date(baseDate);
  minchaBase.setHours(18, 30, 0, 0);
  const minchaOffset = getSeasonalShabbatMinchaOffsetMinutes(date);
  const mincha = new Date(minchaBase.getTime() + minchaOffset * 60 * 1000);

  events.push(
    {
      id: "shacharit",
      title: "שחרית",
      type: "shacharit",
      start: shacharit,
      location: mainLocation,
    },
    {
      id: "mincha",
      title: "מנחה",
      type: "mincha",
      start: mincha,
      location: mainLocation,
    },
    {
      id: "arvit",
      title: "ערבית",
      type: "arvit",
      start: arvit,
      location: mainLocation,
    },
  );

  return {
    date: baseDate,
    events,
  };
}

