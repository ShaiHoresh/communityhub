import type { Location } from "@/lib/locations";
import { getLocations } from "@/lib/locations";
import {
  getScheduleEntries,
  type ScheduleEntry,
  type ScheduleEntryType,
} from "@/lib/schedule-entries";
import { dbGetOverridesForDate } from "@/lib/db-schedule-entries";
import {
  fetchZmanim,
  getApplicableDayTypes,
  isSeasonApplicable,
  calculatePrayerTime,
  type DayType,
  type ZmanimData,
} from "@/lib/zmanim";

export type PrayerType = ScheduleEntryType;

export type PrayerEvent = {
  id: string;
  title: string;
  type: PrayerType;
  start: Date;
  location: Location;
  /** The DayType tags this entry was defined with — used for visual grouping. */
  dayTypes: DayType[];
};

export type DailySchedule = {
  date: Date;
  events: PrayerEvent[];
};

/**
 * Build a concrete daily schedule for a given date.
 *
 * 1. Loads all schedule-entry rules and today's overrides in parallel.
 * 2. Fetches zmanim from Hebcal (cached per day).
 * 3. Filters entries by day-type, season, and specific-date applicability.
 * 4. Applies overrides (cancellations or time changes).
 * 5. Resolves each entry's time via calculatePrayerTime().
 *
 * @param options.isHoliday  - show only "holiday"-tagged entries (no weekday entries)
 * @param options.isErevChag - show only "erev_chag"-tagged entries (no weekday entries)
 *
 * When neither flag is set, getApplicableDayTypes() determines what shows
 * (weekday, erev_shabbat, shabbat, motzei_shabbat).
 */
export async function buildDailyScheduleForDate(
  date: Date,
  mainLocation: Location,
  options: { isHoliday?: boolean; isErevChag?: boolean } = {},
): Promise<DailySchedule> {
  const baseDate = new Date(date);
  baseDate.setHours(0, 0, 0, 0);
  const dateStr = baseDate.toISOString().slice(0, 10);

  const [locations, entries, overrides, zmanim] = await Promise.all([
    getLocations(),
    getScheduleEntries(),
    dbGetOverridesForDate(dateStr),
    fetchZmanim(baseDate),
  ]);

  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const overrideMap = new Map(overrides.map((o) => [o.scheduleEntryId, o]));
  // Holiday / erev-chag days are exclusive: weekday prayers do not bleed through.
  const applicableTypes: DayType[] = options.isHoliday
    ? ["holiday"]
    : options.isErevChag
      ? ["erev_chag"]
      : getApplicableDayTypes(baseDate);

  const events: PrayerEvent[] = [];

  for (const entry of entries) {
    // ── Applicability checks ──
    if (!isSeasonApplicable(entry.season, baseDate)) continue;

    const matchesDay = entry.dayTypes.some((dt) => applicableTypes.includes(dt));
    const matchesSpecific =
      entry.dayTypes.includes("specific_date") &&
      entry.specificDate === dateStr;
    if (!matchesDay && !matchesSpecific) continue;

    // ── Override check ──
    const override = overrideMap.get(entry.id);
    if (override?.isCancelled) continue;

    // ── Resolve time ──
    let hour: number;
    let minute: number;

    if (override && override.overrideHour != null && override.overrideMinute != null) {
      hour = override.overrideHour;
      minute = override.overrideMinute;
    } else {
      const resolved = calculatePrayerTime(
        {
          timeType: entry.timeType,
          fixedHour: entry.fixedHour,
          fixedMinute: entry.fixedMinute,
          zmanKey: entry.zmanKey,
          offsetMinutes: entry.offsetMinutes,
          roundTo: entry.roundTo,
        },
        zmanim,
      );
      if (!resolved) continue;
      hour = resolved.hour;
      minute = resolved.minute;
    }

    const start = new Date(baseDate);
    start.setHours(hour, minute, 0, 0);

    events.push({
      id: entry.id,
      title: entry.title,
      type: entry.type,
      start,
      location: locationMap.get(entry.locationId) ?? mainLocation,
      dayTypes: entry.dayTypes,
    });
  }

  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  return { date: baseDate, events };
}
