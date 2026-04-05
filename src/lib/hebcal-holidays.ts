/**
 * Fetches Jewish holidays and special-day states from the Hebcal API for a
 * given date range.  Uses Next.js fetch cache with a 24-hour TTL.
 *
 * Returns a Map<YYYY-MM-DD, HolidayInfo> for O(1) lookup by date.
 *
 * Flags (all false by default):
 *   isYomTov         – candles, no-melacha Yom Tov
 *   isErev           – "Erev Yom Tov" (the day BEFORE a Yom Tov)
 *   isRoshChodesh    – Rosh Chodesh
 *   isFastDay        – minor or major fast day
 *   isHolHaMoed      – intermediate days of Pesach / Sukkot
 *   isErevChagSheni  – day is BOTH an "erev" AND in Hol HaMoed
 *                      (e.g. Hoshana Raba = Erev Shmini Atzeret,
 *                           20 Nisan = Erev last day of Pesach in Israel)
 */

export type HolidayInfo = {
  /** YYYY-MM-DD */
  date: string;
  /** Hebrew/transliterated holiday name */
  title: string;
  /** True = Yom Tov level (candles, no melacha, special musaf) */
  isYomTov: boolean;
  /** True = eve-of-holiday event (ערב … from Hebcal) */
  isErev: boolean;
  /** True = Rosh Chodesh */
  isRoshChodesh: boolean;
  /** True = fast day (Tzom Gedaliah, 17 Tammuz, Tisha B'Av, etc.) */
  isFastDay: boolean;
  /** True = Hol HaMoed (intermediate days of Pesach / Sukkot) */
  isHolHaMoed: boolean;
  /**
   * True = day is simultaneously an "erev" AND in Hol HaMoed.
   * Typical cases:
   *   - Hoshana Raba (21 Tishrei) = last day of Hol HaMoed Sukkot + Erev Shmini Atzeret
   *   - 20 Nisan (Israel) = last day of Hol HaMoed Pesach + Erev the 7th day of Pesach
   */
  isErevChagSheni: boolean;
};

type HebcalItem = {
  category: string;
  subcat?: string;
  yomtov?: boolean;
  title: string;
  date: string; // ISO 8601, e.g. "2026-04-02T00:00:00+03:00"
};

// Intermediate accumulator before we finalize the HolidayInfo per date
type DayAcc = {
  title: string;
  isYomTov: boolean;
  isErev: boolean;
  isRoshChodesh: boolean;
  isFastDay: boolean;
  isHolHaMoed: boolean;
};

/**
 * Returns a Map<YYYY-MM-DD, HolidayInfo> for all special days in [startDate, endDate].
 * Multiple Hebcal events for the same date are merged into one entry:
 *   – Yom Tov wins over non-Yom-Tov for the `title` / `isYomTov` fields.
 *   – Additive flags (isRoshChodesh, isFastDay, isHolHaMoed) are OR'd together.
 */
export async function fetchHolidaysForRange(
  startDate: Date,
  endDate: Date,
): Promise<Map<string, HolidayInfo>> {
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  try {
    // nx=on  → include Rosh Chodesh
    // maj=on → major holidays (Rosh Hashana, Pesach, Sukkot, …)
    // min=on → minor holidays + fast days (Chanukah, Purim, Tzom, …)
    // mod=off → skip modern Israeli Independence Day etc.
    // s=off  → skip Shabbat entries
    const url =
      `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&nx=on&mod=off&s=off` +
      `&lg=he&start=${start}&end=${end}&geo=geoname&geonameid=281184`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return new Map();

    const json = (await res.json()) as { items?: HebcalItem[] };
    const items = json.items ?? [];

    // First pass: accumulate all flags per date
    const acc = new Map<string, DayAcc>();

    const ensureDate = (dateStr: string): DayAcc => {
      if (!acc.has(dateStr)) {
        acc.set(dateStr, {
          title: "",
          isYomTov: false,
          isErev: false,
          isRoshChodesh: false,
          isFastDay: false,
          isHolHaMoed: false,
        });
      }
      return acc.get(dateStr)!;
    };

    for (const item of items) {
      const dateStr = item.date.slice(0, 10);
      const day = ensureDate(dateStr);

      // ── Rosh Chodesh ──────────────────────────────────────────────────────
      if (item.category === "roshchodesh") {
        day.isRoshChodesh = true;
        if (!day.title) day.title = item.title;
        continue;
      }

      // ── Holiday category (major, minor, fast, cholhamoed, erev) ──────────
      if (item.category === "holiday") {
        const isErev = item.subcat === "erev";
        const isYomTov = item.yomtov === true;
        const isFast = item.subcat === "fast";
        const isHolHaMoed = item.subcat === "cholhamoed";

        if (isFast) {
          day.isFastDay = true;
          if (!day.title) day.title = item.title;
          continue;
        }

        if (isHolHaMoed) {
          day.isHolHaMoed = true;
          // Hol HaMoed gets title only when nothing more prominent is set
          if (!day.isYomTov && !day.isErev) day.title = item.title;
          continue;
        }

        if (isErev) {
          day.isErev = true;
          // Erev title wins unless a yomtov entry also falls on this date
          if (!day.isYomTov) day.title = item.title;
          continue;
        }

        // Regular holiday or Yom Tov
        if (isYomTov && !day.isYomTov) {
          // Upgrade: Yom Tov beats all other entries for title/isYomTov
          day.title = item.title;
          day.isYomTov = true;
        } else if (!day.isYomTov && !day.title) {
          day.title = item.title;
        }
      }
    }

    // Second pass: build final HolidayInfo, adding isErevChagSheni
    const result = new Map<string, HolidayInfo>();
    for (const [dateStr, day] of acc) {
      // Only emit an entry if something interesting happened on this date
      if (
        !day.isYomTov &&
        !day.isErev &&
        !day.isRoshChodesh &&
        !day.isFastDay &&
        !day.isHolHaMoed
      ) {
        continue;
      }

      result.set(dateStr, {
        date: dateStr,
        title: day.title,
        isYomTov: day.isYomTov,
        isErev: day.isErev,
        isRoshChodesh: day.isRoshChodesh,
        isFastDay: day.isFastDay,
        isHolHaMoed: day.isHolHaMoed,
        // A day is erev_chag_sheni when it's simultaneously an erev AND in Hol HaMoed.
        isErevChagSheni: day.isErev && day.isHolHaMoed,
      });
    }

    return result;
  } catch {
    return new Map();
  }
}
