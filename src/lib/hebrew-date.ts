/**
 * Hebrew date utilities — no external library required.
 *
 * Uses the built-in `Intl.DateTimeFormat` with `calendar: 'hebrew'` to get
 * the Hebrew month name and weekday, then converts the numeric day to Hebrew
 * letter-numerals (gematria) for an authentic display.
 *
 * Output examples:
 *   formatHebrewDate(date)      →  "יום חמישי, ח בניסן"
 *   formatHebrewDateShort(date) →  "ח בניסן"
 *   formatBiDate(date)          →  "ח בניסן · 12.3.26"
 */

// ── Gematria helpers ──────────────────────────────────────────────────────────

const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל"];

/**
 * Convert a Hebrew calendar day (1–30) to its Hebrew letter-numeral string.
 * Handles the special cases 15 (ט״ו) and 16 (ט״ז) to avoid writing divine names.
 */
export function toHebrewNumeral(n: number): string {
  if (n === 15) return "ט\u05f4ו"; // ט״ו
  if (n === 16) return "ט\u05f4ז"; // ט״ז
  if (n < 1 || n > 30) return String(n);

  const tensStr = TENS[Math.floor(n / 10)] ?? "";
  const onesStr = ONES[n % 10] ?? "";
  const combined = tensStr + onesStr;

  if (combined.length <= 1) return combined;
  // Insert gershayim (״) before the last letter
  return combined.slice(0, -1) + "\u05f4" + combined.slice(-1);
}

// ── Formatters ────────────────────────────────────────────────────────────────

/**
 * Full Hebrew date: "יום חמישי, ח בניסן"
 * Used in the GlobalHeader.
 */
export function formatHebrewDate(date: Date): string {
  try {
    const df = new Intl.DateTimeFormat("he-u-ca-hebrew", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const parts = df.formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const dayNum = parseInt(parts.find((p) => p.type === "day")?.value ?? "1", 10);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    return `${weekday}, ${toHebrewNumeral(dayNum)} ב${month}`;
  } catch {
    return "";
  }
}

/**
 * Short Hebrew date without weekday: "ח בניסן"
 */
export function formatHebrewDateShort(date: Date): string {
  try {
    const df = new Intl.DateTimeFormat("he-u-ca-hebrew", {
      day: "numeric",
      month: "long",
    });
    const parts = df.formatToParts(date);
    const dayNum = parseInt(parts.find((p) => p.type === "day")?.value ?? "1", 10);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    return `${toHebrewNumeral(dayNum)} ב${month}`;
  } catch {
    return "";
  }
}

/**
 * Gregorian date in Hebrew locale: "12 במרץ 2026"
 */
export function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Short Gregorian: "12.3.26"
 */
export function formatGregorianShort(date: Date): string {
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "numeric",
    year: "2-digit",
  });
}

/**
 * Bi-date for inline use: "ח בניסן · 12.3.26"
 * Falls back to Gregorian only if Hebrew formatting fails.
 */
export function formatBiDate(date: Date): string {
  const heb = formatHebrewDateShort(date);
  const greg = formatGregorianShort(date);
  return heb ? `${heb} · ${greg}` : greg;
}
