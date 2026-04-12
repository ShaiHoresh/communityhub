/**
 * Fetches the upcoming Shabbat / holiday candle-lighting and Havdalah times
 * from the Hebcal public API for Jerusalem.
 *
 * The Hebcal /shabbat endpoint only returns candle-lighting and havdalah times
 * for actual Shabbat and major Yom Tov (it never returns these for minor
 * holidays, Chol HaMoed, or modern Israeli observances), so filtering is
 * handled at the API level.
 *
 * Uses Next.js fetch cache with revalidate: 86400 (24-hour TTL).
 */

export type ShabbatTimes = {
  candleLighting: string | null;
  havdalah: string | null;
  /** Torah portion title, e.g. "פרשת ויקהל-פקודי", or holiday name */
  parashaTitle: string | null;
  /**
   * True when the upcoming event is a major Yom Tov (not a regular Shabbat).
   * Used to choose the correct Hebrew label in the header:
   *   false → "כניסת השבת" / "יציאת השבת"
   *   true  → "כניסת החג"  / "יציאת החג"
   */
  isYomTov: boolean;
};

type HebcalItem = {
  category: string;
  /** Present on holiday items; true = full Yom Tov (issur melacha) */
  yomtov?: boolean;
  title: string;
  date: string;
};

function extractHHMM(isoDate: string): string | null {
  const match = isoDate.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

export async function fetchShabbatTimes(): Promise<ShabbatTimes> {
  const empty: ShabbatTimes = {
    candleLighting: null,
    havdalah: null,
    parashaTitle: null,
    isYomTov: false,
  };
  try {
    // Jerusalem geonameid=281184, candle lighting 40 min before sunset, havdalah 18 min after
    const res = await fetch(
      "https://www.hebcal.com/shabbat?cfg=json&geonameid=281184&m=40&b=18&lg=he",
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return empty;

    const json = (await res.json()) as { items?: HebcalItem[] };
    const items = json.items;
    if (!items) return empty;

    const candles = items.find((i) => i.category === "candles");
    const havdalah = items.find((i) => i.category === "havdalah");

    // A holiday item with yomtov:true signals a full Yom Tov (issur melacha).
    // When both a holiday and parashat appear (e.g. Yom Tov on Shabbat),
    // the holiday takes precedence for labeling purposes.
    const holidayItem = items.find(
      (i) => i.category === "holiday" && i.yomtov === true,
    );
    const parashaItem = items.find((i) => i.category === "parashat");

    const isYomTov = !!holidayItem;
    const titleItem = holidayItem ?? parashaItem;

    // If the API returned no candle-lighting at all, hide the section entirely.
    if (!candles && !havdalah) return empty;

    return {
      candleLighting: candles ? extractHHMM(candles.date) : null,
      havdalah: havdalah ? extractHHMM(havdalah.date) : null,
      parashaTitle: titleItem?.title ?? null,
      isYomTov,
    };
  } catch {
    return empty;
  }
}

/** Returns the current Hebrew date as a formatted string ("יום חמישי, ח בניסן"). */
export { formatHebrewDate as getHebrewDateString } from "@/lib/hebrew-date";
