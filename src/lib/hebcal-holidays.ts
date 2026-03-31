/**
 * Fetches major Jewish holidays from the Hebcal API for a given date range.
 * Uses Next.js fetch cache with 24-hour TTL (same as zmanim/shabbat times).
 *
 * Returns a Map of YYYY-MM-DD → HolidayInfo for easy O(1) lookup by date.
 */

export type HolidayInfo = {
  /** YYYY-MM-DD */
  date: string;
  /** Hebrew name of the holiday, e.g. "פסח א׳" */
  title: string;
  /**
   * true  = Yom Tov level (candles, no melacha, special davening)
   * false = minor / erev / chol hamoed
   */
  isYomTov: boolean;
  /**
   * true = this is an "erev" (eve) event, e.g. "ערב פסח", "ערב ראש השנה".
   * These days are treated as "ערב חג" in the schedule and prayers tagged
   * erev_chag will be shown. The FOLLOWING day is the actual Yom Tov.
   */
  isErev: boolean;
};

type HebcalItem = {
  category: string;
  subcat?: string;
  yomtov?: boolean;
  title: string;
  date: string; // ISO 8601 with TZ, e.g. "2026-04-02T00:00:00+03:00"
};

/**
 * Returns a Map<YYYY-MM-DD, HolidayInfo> for all holidays in the range.
 * Prefers Yom-Tov entries over Erev/minor entries for the same date.
 */
export async function fetchHolidaysForRange(
  startDate: Date,
  endDate: Date,
): Promise<Map<string, HolidayInfo>> {
  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  try {
    // maj=on  → Rosh Hashana, Yom Kippur, Pesach, Shavuot, Sukkot, etc.
    // min=on  → Chanukah, Purim, fast days, Lag BaOmer, etc.
    // nx=off  → skip Rosh Chodesh
    // mod=off → skip modern Israeli holidays
    const url =
      `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&nx=off&mod=off&s=off` +
      `&lg=he&start=${start}&end=${end}&geo=geoname&geonameid=281184`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return new Map();

    const json = (await res.json()) as { items?: HebcalItem[] };
    const items = json.items ?? [];

    const result = new Map<string, HolidayInfo>();

    for (const item of items) {
      if (item.category !== "holiday") continue;
      const dateStr = item.date.slice(0, 10);

      // Keep the first entry OR upgrade to a yomtov entry if a better one appears
      const isErev = item.subcat === "erev";
      const isYomTov = item.yomtov === true;

      const existing = result.get(dateStr);
      // Prefer yomtov entries over non-yomtov; erev subcat always wins for erev days
      if (!existing || (!existing.isYomTov && isYomTov)) {
        result.set(dateStr, {
          date: dateStr,
          title: item.title,
          isYomTov,
          isErev,
        });
      }
    }

    return result;
  } catch {
    return new Map();
  }
}
