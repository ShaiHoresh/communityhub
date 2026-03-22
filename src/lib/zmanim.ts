/**
 * Zmanim (halachic times) integration via the Hebcal API.
 *
 * Provides fetchZmanim() for daily sun-based times, and
 * calculatePrayerTime() which resolves a schedule entry rule
 * to a concrete HH:mm for a given date.
 *
 * Configure via env vars:
 *   ZMANIM_LATITUDE   (default 31.7683 – Jerusalem)
 *   ZMANIM_LONGITUDE  (default 35.2137)
 *   ZMANIM_TZID       (default Asia/Jerusalem)
 */

// ── Zman keys the system supports ──────────────────────────────────────

export const ZMAN_KEYS = [
  "sunrise",
  "sunset",
  "chatzot",
  "alotHaShachar",
  "misheyakir",
  "minchaGedola",
  "minchaKetana",
  "plagHaMincha",
  "tzeit7083deg",
] as const;

export type ZmanKey = (typeof ZMAN_KEYS)[number];

export const ZMAN_LABELS: Record<ZmanKey, string> = {
  sunrise: "הנץ החמה",
  sunset: "שקיעה",
  chatzot: "חצות היום",
  alotHaShachar: "עלות השחר",
  misheyakir: "משיכיר",
  minchaGedola: "מנחה גדולה",
  minchaKetana: "מנחה קטנה",
  plagHaMincha: "פלג המנחה",
  tzeit7083deg: "צאת הכוכבים",
};

// ── Day-type / season enums ────────────────────────────────────────────

export const DAY_TYPES = ["weekday", "shabbat", "holiday", "specific_date"] as const;
export type DayType = (typeof DAY_TYPES)[number];

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  weekday: "חול",
  shabbat: "שבת",
  holiday: "חג",
  specific_date: "תאריך מסוים",
};

export const SEASONS = ["always", "winter_only", "summer_only"] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_LABELS: Record<Season, string> = {
  always: "תמיד",
  winter_only: "חורף בלבד",
  summer_only: "קיץ בלבד",
};

export const TIME_TYPES = ["FIXED", "ZMANIM_BASED", "DYNAMIC_OFFSET"] as const;
export type TimeType = (typeof TIME_TYPES)[number];

export const TIME_TYPE_LABELS: Record<TimeType, string> = {
  FIXED: "שעה קבועה",
  ZMANIM_BASED: "לפי זמן הלכתי",
  DYNAMIC_OFFSET: "זמן הלכתי + הזזה",
};

// ── Zmanim data fetching ───────────────────────────────────────────────

export type ZmanimData = Record<ZmanKey, string>;

const zmanimCache = new Map<string, ZmanimData>();

function parseTimeFromISO(isoStr: string): { hour: number; minute: number } | null {
  const match = isoStr.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
}

export async function fetchZmanim(date: Date): Promise<ZmanimData | null> {
  const dateStr = date.toISOString().slice(0, 10);
  const cached = zmanimCache.get(dateStr);
  if (cached) return cached;

  const lat = process.env.ZMANIM_LATITUDE ?? "31.7683";
  const lng = process.env.ZMANIM_LONGITUDE ?? "35.2137";
  const tzid = process.env.ZMANIM_TZID ?? "Asia/Jerusalem";

  try {
    const url =
      `https://www.hebcal.com/zmanim?cfg=json` +
      `&latitude=${lat}&longitude=${lng}&tzid=${tzid}&date=${dateStr}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const json = await res.json();
    const times = json.times as Record<string, string> | undefined;
    if (!times) return null;

    const result = {} as ZmanimData;
    for (const key of ZMAN_KEYS) {
      result[key] = times[key] ?? "";
    }

    zmanimCache.set(dateStr, result);
    return result;
  } catch {
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

export function getDayType(date: Date): DayType {
  return date.getDay() === 6 ? "shabbat" : "weekday";
}

export function isWinterSeason(date: Date): boolean {
  const m = date.getMonth(); // 0-based
  return m >= 10 || m <= 2; // Nov–Mar
}

export function isSeasonApplicable(season: Season, date: Date): boolean {
  if (season === "always") return true;
  const winter = isWinterSeason(date);
  return season === "winter_only" ? winter : !winter;
}

function roundMinutes(totalMins: number, roundTo: number): number {
  if (roundTo <= 0) return totalMins;
  return Math.round(totalMins / roundTo) * roundTo;
}

// ── Core prayer-time calculation ───────────────────────────────────────

export type PrayerTimeInput = {
  timeType: TimeType;
  fixedHour: number | null;
  fixedMinute: number | null;
  zmanKey: ZmanKey | null;
  offsetMinutes: number;
  roundTo: number;
};

/**
 * Given a prayer rule and the day's zmanim, returns the concrete {hour,minute}
 * or null if the time cannot be resolved (e.g. missing zmanim for a
 * ZMANIM_BASED rule).
 */
export function calculatePrayerTime(
  input: PrayerTimeInput,
  zmanim: ZmanimData | null,
): { hour: number; minute: number } | null {
  if (input.timeType === "FIXED") {
    if (input.fixedHour == null || input.fixedMinute == null) return null;
    let total = input.fixedHour * 60 + input.fixedMinute;
    total = roundMinutes(total, input.roundTo);
    return { hour: Math.floor(total / 60) % 24, minute: total % 60 };
  }

  // ZMANIM_BASED or DYNAMIC_OFFSET
  if (!input.zmanKey || !zmanim) return null;
  const raw = zmanim[input.zmanKey];
  if (!raw) return null;

  const parsed = parseTimeFromISO(raw);
  if (!parsed) return null;

  const offset = input.timeType === "DYNAMIC_OFFSET" ? input.offsetMinutes : 0;
  let total = parsed.hour * 60 + parsed.minute + offset;
  total = roundMinutes(total, input.roundTo);

  while (total < 0) total += 1440;
  total = total % 1440;

  return { hour: Math.floor(total / 60), minute: total % 60 };
}

/** Format {hour,minute} to "HH:mm". */
export function formatHM(hm: { hour: number; minute: number }): string {
  return `${String(hm.hour).padStart(2, "0")}:${String(hm.minute).padStart(2, "0")}`;
}
