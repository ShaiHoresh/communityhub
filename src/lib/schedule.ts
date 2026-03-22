import type { Location } from "@/lib/locations";
import { getLocations } from "@/lib/locations";
import {
  getScheduleEntries,
  type ScheduleEntry,
  type ScheduleEntryType,
} from "@/lib/schedule-entries";

export type PrayerType = ScheduleEntryType;

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

// Month index → mincha offset in minutes (winter=-15, shoulder=0, summer=+15)
const MINCHA_OFFSET_BY_MONTH: Record<number, number> = {
  0: -15, 1: -15, 11: -15,  // Dec–Feb: winter
  2: 0, 3: 0, 8: 0, 9: 0,  // Mar–Apr, Sep–Oct: shoulder
  4: 15, 5: 15, 6: 15, 7: 15, 10: 15,  // May–Aug, Nov: summer
};

export function getSeasonalShabbatMinchaOffsetMinutes(date: Date): number {
  return MINCHA_OFFSET_BY_MONTH[date.getMonth()] ?? 0;
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
      type: entry.type,
      start,
      location,
    };
  });

  return { date: baseDate, events };
}
