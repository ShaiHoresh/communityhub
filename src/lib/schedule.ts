import type { Location } from "@/lib/locations";
import { getLocations } from "@/lib/locations";
import {
  getScheduleEntries,
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

export function getSeasonalShabbatMinchaOffsetMinutes(date: Date): number {
  const month = date.getMonth();

  if (month === 11 || month <= 1) {
    return -15;
  }

  if (month === 2 || month === 3 || month === 8 || month === 9) {
    return 0;
  }

  return 15;
}

export async function buildDailyScheduleForDate(
  date: Date,
  mainLocation: Location,
): Promise<DailySchedule> {
  const [locations, entries] = await Promise.all([
    getLocations(),
    getScheduleEntries(),
  ]);

  const locationMap = new Map(locations.map((l) => [l.id, l]));

  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);

  const events: PrayerEvent[] = entries.map((entry) => {
    const location = locationMap.get(entry.locationId) ?? mainLocation;
    let start = new Date(baseDate);
    start.setHours(entry.hour, entry.minute, 0, 0);

    if (entry.type === "mincha" && entry.useSeasonalMinchaOffset) {
      const offset = getSeasonalShabbatMinchaOffsetMinutes(date);
      start = new Date(start.getTime() + offset * 60 * 1000);
    }

    return {
      id: entry.id,
      title: entry.title,
      type: entry.type as PrayerType,
      start,
      location,
    };
  });

  return { date: baseDate, events };
}
