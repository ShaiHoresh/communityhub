/**
 * Fetches the upcoming holy-day timeline (candle lighting, transitions, havdalah)
 * for Jerusalem from the Hebcal API, looking ahead up to 7 days.
 *
 * Handles all complex sequences:
 *  - Simple weekly Shabbat                  → [entry, exit]
 *  - Single-day Yom Tov                     → [entry, exit]
 *  - 2-day Yom Tov (Rosh Hashanah)          → [entry, transition, exit]
 *  - Yom Tov immediately before Shabbat     → [yomtov-entry, candle-transition, shabbat-exit]
 *  - Shabbat immediately before Yom Tov     → [shabbat-entry, candle-transition, yomtov-exit]
 *  - Full 3-day window (YT + Shabbat + YT)  → [entry, transition, transition, exit]
 *
 * The Hebcal /hebcal endpoint with s=on only emits `candles` and `havdalah` events
 * for actual Shabbat and major Yom Tov, so minor holidays/Chol HaMoed/modern days
 * are filtered out at the API level.
 *
 * Uses Next.js fetch cache with revalidate: 86400 (24-hour TTL).
 */

/** A single labeled time entry in the display timeline. */
export type TimelineItem = {
  /** Hebrew label, e.g. "כניסת החג" */
  label: string;
  /** HH:MM clock time */
  time: string;
};

export type ShabbatTimes = {
  /**
   * Ordered list of transition events for the upcoming holy-day period.
   * Empty when no Shabbat or major Yom Tov is found in the next ~7 days.
   */
  timeline: TimelineItem[];
  /** Torah portion or holiday name for the upcoming period. */
  parashaTitle: string | null;
};

// ── Internal API types ────────────────────────────────────────────────────────

type HebcalItem = {
  category: string;
  /** Present on holiday items; true = full Yom Tov with issur melacha. */
  yomtov?: boolean;
  title: string;
  /** ISO 8601 – may have time component, e.g. "2026-04-17T18:45:00+03:00" */
  date: string;
};

type TimedEvent = {
  type: "candles" | "havdalah";
  /** YYYY-MM-DD — the civil date on which this event falls */
  date: string;
  /** HH:MM */
  time: string;
  /** Full ISO string used for chronological sorting and "is this in the future?" */
  isoFull: string;
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function extractHHMM(isoDate: string): string | null {
  const m = isoDate.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}

/** Returns YYYY-MM-DD for the civil date that is `days` days after `dateStr`. */
function shiftDate(dateStr: string, days: number): string {
  // Use noon UTC to stay safe across DST transitions.
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchShabbatTimes(): Promise<ShabbatTimes> {
  const empty: ShabbatTimes = { timeline: [], parashaTitle: null };
  try {
    const now = new Date();
    const start = now.toISOString().slice(0, 10);
    const end = shiftDate(start, 7);

    // s=on  → Shabbat events (candles + havdalah for Friday/Saturday)
    // maj=on → major Yom Tov (also emits candles + havdalah)
    // min/nx/mod=off → skip minor holidays, Rosh Chodesh, modern Israeli days
    // m=40  → candle lighting 40 min before sunset (Jerusalem custom)
    // b=18  → havdalah 18 min after nightfall
    const url =
      `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=off&nx=off&mod=off&s=on` +
      `&lg=he&start=${start}&end=${end}&geo=geoname&geonameid=281184&m=40&b=18`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return empty;

    const json = (await res.json()) as { items?: HebcalItem[] };
    const items = json.items ?? [];

    // ── Build holy-day type sets ──────────────────────────────────────────────

    // Every Saturday in the window is a potential Shabbat.
    const shabbatDates = new Set<string>();
    for (
      let d = new Date(`${start}T12:00:00Z`);
      d.toISOString().slice(0, 10) <= end;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      if (d.getUTCDay() === 6) shabbatDates.add(d.toISOString().slice(0, 10));
    }

    // Dates that carry a full Yom Tov (yomtov: true in the Hebcal response).
    const yomTovDates = new Set<string>();
    for (const item of items) {
      if (item.category === "holiday" && item.yomtov === true) {
        yomTovDates.add(item.date.slice(0, 10));
      }
    }

    // ── Extract timed events ──────────────────────────────────────────────────

    const timedEvents: TimedEvent[] = [];
    for (const item of items) {
      if (item.category !== "candles" && item.category !== "havdalah") continue;
      const time = extractHHMM(item.date);
      if (!time) continue;
      timedEvents.push({
        type: item.category as "candles" | "havdalah",
        date: item.date.slice(0, 10),
        time,
        isoFull: item.date,
      });
    }

    // Sort chronologically (Hebcal usually returns them in order, but be safe).
    timedEvents.sort((a, b) => a.isoFull.localeCompare(b.isoFull));

    if (timedEvents.length === 0) return empty;

    // ── Identify the active sequence ──────────────────────────────────────────
    //
    // A "sequence" is: [candles, (candles)*, havdalah]
    // Strategy:
    //   1. Find the first havdalah that hasn't happened yet.
    //   2. Walk backwards collecting consecutive candles events — they all
    //      belong to the same holy-day block.

    const nowMs = now.getTime();

    let seqEndIdx = -1;
    for (let i = 0; i < timedEvents.length; i++) {
      if (
        timedEvents[i].type === "havdalah" &&
        new Date(timedEvents[i].isoFull).getTime() > nowMs
      ) {
        seqEndIdx = i;
        break;
      }
    }
    if (seqEndIdx === -1) return empty;

    // Walk backwards to collect the opening candles event(s).
    let seqStartIdx = seqEndIdx;
    while (
      seqStartIdx > 0 &&
      timedEvents[seqStartIdx - 1].type === "candles"
    ) {
      seqStartIdx--;
    }

    const sequence = timedEvents.slice(seqStartIdx, seqEndIdx + 1);

    // ── Determine which holy-day types appear in the sequence ─────────────────
    //
    // A candles event on date D → the holy day begins the NEXT day (D+1).
    // The havdalah event on date D → the holy day that ended is on date D.

    const sequenceDays = new Set<string>();
    for (const ev of sequence) {
      sequenceDays.add(
        ev.type === "candles" ? shiftDate(ev.date, 1) : ev.date,
      );
    }

    const sequenceHasShabbat = [...sequenceDays].some((d) =>
      shabbatDates.has(d),
    );
    const sequenceHasYomTov = [...sequenceDays].some((d) =>
      yomTovDates.has(d),
    );

    // ── Build labeled timeline ────────────────────────────────────────────────

    const timeline: TimelineItem[] = [];

    for (let i = 0; i < sequence.length; i++) {
      const ev = sequence[i];
      const isFirst = i === 0;

      if (ev.type === "candles") {
        // What holy day starts the morning after this candle lighting?
        const nextDay = shiftDate(ev.date, 1);
        const nextIsShabbat = shabbatDates.has(nextDay);
        const nextIsYomTov = yomTovDates.has(nextDay);

        if (isFirst) {
          // ── Entry into the first holy day ────────────────────────────────
          if (nextIsYomTov && nextIsShabbat) {
            // Rare: Yom Kippur on Shabbat, or Shavuot on Shabbat, etc.
            timeline.push({ label: "כניסת שבת וחג", time: ev.time });
          } else if (nextIsYomTov) {
            timeline.push({ label: "כניסת החג", time: ev.time });
          } else {
            // Regular Shabbat (or Shabbat with no Yom Tov)
            timeline.push({ label: "כניסת השבת", time: ev.time });
          }
        } else {
          // ── Transition between two consecutive holy days ──────────────────
          // The day OF this candles event is the first holy day ending now.
          const prevIsShabbat = shabbatDates.has(ev.date);
          const prevIsYomTov = yomTovDates.has(ev.date);

          if (prevIsYomTov && nextIsShabbat) {
            // Yom Tov → Shabbat (e.g., Yom Tov on Friday → Shabbat)
            timeline.push({ label: "כניסת שבת / הדלקת נרות", time: ev.time });
          } else if (prevIsShabbat && nextIsYomTov) {
            // Shabbat → Yom Tov (e.g., Shabbat before Yom Tov)
            timeline.push({ label: "כניסת החג / הדלקת נרות", time: ev.time });
          } else {
            // Yom Tov → Yom Tov (Day 1 → Day 2, e.g., Rosh Hashanah)
            timeline.push({ label: "יציאת יום א׳ / הדלקת נרות", time: ev.time });
          }
        }
      } else {
        // ── Havdalah: exit from the final holy day ───────────────────────────
        const lastIsShabbat = shabbatDates.has(ev.date);

        if (lastIsShabbat && sequenceHasYomTov) {
          // Sequence ended on Shabbat but also contained Yom Tov.
          timeline.push({ label: "יציאת שבת וחג", time: ev.time });
        } else if (lastIsShabbat) {
          timeline.push({ label: "יציאת השבת", time: ev.time });
        } else {
          // Ends on a Yom Tov day (may or may not have had Shabbat earlier).
          timeline.push({ label: "יציאת החג", time: ev.time });
        }
      }
    }

    // ── Find parasha / holiday title ──────────────────────────────────────────

    let parashaTitle: string | null = null;
    for (const item of items) {
      const d = item.date.slice(0, 10);
      if (!sequenceDays.has(d)) continue;
      if (item.category === "holiday" && item.yomtov === true) {
        parashaTitle = item.title;
        break; // Holiday name takes precedence over parasha
      }
      if (item.category === "parashat" && !parashaTitle) {
        parashaTitle = item.title;
      }
    }

    return { timeline, parashaTitle };
  } catch {
    return empty;
  }
}

/** Returns the current Hebrew date as a formatted string ("יום חמישי, ח בניסן"). */
export { formatHebrewDate as getHebrewDateString } from "@/lib/hebrew-date";
