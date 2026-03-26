/**
 * Fetches the upcoming Shabbat / holiday candle-lighting and Havdalah times
 * from the Hebcal public API for Jerusalem.
 *
 * Uses Next.js fetch cache with revalidate: 86400 (24-hour TTL).
 */

export type ShabbatTimes = {
  candleLighting: string | null;
  havdalah: string | null;
  /** Torah portion title, e.g. "פרשת ויקהל-פקודי" */
  parashaTitle: string | null;
};

type HebcalItem = {
  category: string;
  title: string;
  date: string;
};

function extractHHMM(isoDate: string): string | null {
  const match = isoDate.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

export async function fetchShabbatTimes(): Promise<ShabbatTimes> {
  const empty: ShabbatTimes = { candleLighting: null, havdalah: null, parashaTitle: null };
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
    const parasha = items.find(
      (i) => i.category === "parashat" || i.category === "holiday",
    );

    return {
      candleLighting: candles ? extractHHMM(candles.date) : null,
      havdalah: havdalah ? extractHHMM(havdalah.date) : null,
      parashaTitle: parasha?.title ?? null,
    };
  } catch {
    return empty;
  }
}

/** Returns the current Hebrew date as a formatted string ("יום חמישי, ח בניסן"). */
export { formatHebrewDate as getHebrewDateString } from "@/lib/hebrew-date";
