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
  getDayType,
  isSeasonApplicable,
  calculatePrayerTime,
  type ZmanimData,
} from "@/lib/zmanim";

export type PrayerType = ScheduleEntryType;

export type PrayerEvent = {
  id: string;
  title: string;
  type: PrayerType;
  start: Date;
  location: Location;
  /** The raw dayTypes from the schedule entry that produced this event. */
  dayTypes: string[];
};

export type DailySchedule = {
  date: Date;
  events: PrayerEvent[];
};

/**
 * Optional flags passed by the 7-day schedule page to augment the base
 * day-type set (weekday / shabbat) with additive Jewish-calendar types
 * derived from the Hebcal holidays API.
 *
 * Any flag set to true causes the corresponding day-type string to be added
 * to the active set, so schedule entries tagged with that type are included.
 */
export type ScheduleOptions = {
  isHoliday?: boolean;
  isErevChag?: boolean;
  isRoshChodesh?: boolean;
  isFastDay?: boolean;
  isHolHaMoed?: boolean;
  isErevChagSheni?: boolean;
  isErevShabbatHolHaMoed?: boolean;
};

/**
 * Build a concrete daily schedule for a given date.
 *
 * 1. Loads all schedule-entry rules and today's overrides in parallel.
 * 2. Fetches zmanim from Hebcal (cached per day).
 * 3. Filters entries by day-type, season, and specific-date applicability.
 * 4. Applies overrides (cancellations or time changes).
 * 5. Resolves each entry's time via calculatePrayerTime().
 */
export async function buildDailyScheduleForDate(
  date: Date,
  mainLocation: Location,
  opts?: ScheduleOptions,
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
  const baseDayType = getDayType(baseDate);

  // Build the complete set of active day types for this date.
  const activeDayTypes = new Set<string>([baseDayType]);
  if (opts?.isHoliday)               activeDayTypes.add("holiday");
  if (opts?.isErevChag)              activeDayTypes.add("erev_chag");
  if (opts?.isRoshChodesh)           activeDayTypes.add("rosh_chodesh");
  if (opts?.isFastDay)               activeDayTypes.add("fast_day");
  if (opts?.isHolHaMoed)             activeDayTypes.add("hol_hamoed");
  if (opts?.isErevChagSheni)         activeDayTypes.add("erev_chag_sheni");
  if (opts?.isErevShabbatHolHaMoed)  activeDayTypes.add("erev_shabbat_hol_hamoed");

  const events: PrayerEvent[] = [];

  for (const entry of entries) {
    // ── Applicability checks ──
    if (!isSeasonApplicable(entry.season, baseDate)) continue;

    const matchesDay = entry.dayTypes.some((t) => activeDayTypes.has(t));
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
