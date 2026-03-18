import type { Location } from "@/lib/locations";
import { getLocations } from "@/lib/locations";
import { getLocationById } from "@/lib/locations";
import { dbEnsureLocations } from "@/lib/db-locations";
import {
  getScheduleEntries,
  ensureDefaultScheduleEntries,
  type ScheduleEntry,
} from "@/lib/schedule-entries";

export type PrayerType = "shacharit" | "mincha" | "arvit" | "lesson";

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
  const seedLocations = await getLocations();
  await dbEnsureLocations(seedLocations);
  await ensureDefaultScheduleEntries(mainLocation.id);
  const entries = await getScheduleEntries();
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  const events: PrayerEvent[] = [];

  for (const entry of entries) {
    const location = (await getLocationById(entry.locationId)) ?? mainLocation;
    let start = new Date(baseDate);
    start.setHours(entry.hour, entry.minute, 0, 0);

    if (entry.type === "mincha" && entry.useSeasonalMinchaOffset) {
      const offset = getSeasonalShabbatMinchaOffsetMinutes(date);
      start = new Date(start.getTime() + offset * 60 * 1000);
    }

    events.push({
      id: entry.id,
      title: entry.title,
      type: entry.type as PrayerType,
      start,
      location,
    });
  }

  return {
    date: baseDate,
    events,
  };
}

