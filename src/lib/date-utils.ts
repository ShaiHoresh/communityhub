/**
 * Date utilities that are timezone-aware for Asia/Jerusalem.
 *
 * The community is in Israel (UTC+2 in winter, UTC+3 in summer / DST).
 * Node.js servers deployed on Vercel/cloud typically run in UTC.
 * Using `new Date().toISOString().slice(0, 10)` gives the UTC civil date,
 * which between 00:00–02:59 Jerusalem local time is the *previous* calendar
 * day — causing schedule overrides, zmanim requests, and holiday lookups to
 * be off by one day during that window.
 *
 * Always use `toLocalDateStr()` wherever a "YYYY-MM-DD" calendar-date string
 * is needed for business logic.
 */

const ISRAEL_TZ = "Asia/Jerusalem";

const israelDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ISRAEL_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Returns the civil calendar date for `date` as "YYYY-MM-DD" using the
 * Israel (Asia/Jerusalem) timezone, regardless of the server's local TZ.
 *
 * `en-CA` locale produces ISO-style "YYYY-MM-DD" output directly.
 */
export function toLocalDateStr(date: Date): string {
  return israelDateFormatter.format(date);
}

/**
 * Returns a Date object representing local midnight (00:00:00) on the civil
 * calendar date of `date` in Asia/Jerusalem, expressed as a UTC timestamp.
 *
 * Useful when you need a Date object that, when passed to `toLocalDateStr()`,
 * reliably yields the same calendar date regardless of server TZ.
 */
export function toLocalMidnight(date: Date): Date {
  const str = toLocalDateStr(date); // "YYYY-MM-DD"
  // Parse as UTC midnight — this gives a stable anchor for the calendar day.
  return new Date(str + "T00:00:00Z");
}
