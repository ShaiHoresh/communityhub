import Image from "next/image";
import Link from "next/link";
import { HeaderAuthButtons } from "./HeaderAuthButtons";
import { fetchShabbatTimes } from "@/lib/shabbat-times";
import { formatHebrewDate, formatGregorianDate } from "@/lib/hebrew-date";

/**
 * Sticky global nav bar rendered once in the root layout.
 *
 * Two rows:
 *  1. Slim calendar bar  — Hebrew date (right) · Shabbat/holiday times (left)
 *  2. Main nav bar       — logo + site name (right) · auth buttons (left)
 */
export async function GlobalHeader() {
  const shabbatTimes = await fetchShabbatTimes().catch(() => ({
    candleLighting: null,
    havdalah: null,
    parashaTitle: null,
  }));

  const now = new Date();
  const hebrewDate = formatHebrewDate(now);
  const gregorianDate = formatGregorianDate(now);
  const hasShabbatInfo = !!(shabbatTimes.candleLighting || shabbatTimes.havdalah);

  return (
    <header
      className="sticky top-0 z-50 border-b border-secondary/10 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:bg-slate-900/90 dark:supports-[backdrop-filter]:bg-slate-900/80 dark:border-slate-700/50"
      role="banner"
    >
      {/* ── Calendar info bar ── */}
      <div className="border-b border-secondary/8 bg-primary/4 px-6 sm:px-12 dark:bg-slate-800/40 dark:border-slate-700/40">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between gap-4 text-xs">
          {/* Date — right side in RTL: Hebrew always shown, Gregorian hidden on xs */}
          <span className="shrink-0 font-medium text-foreground/80">
            {hebrewDate}
            {gregorianDate && (
              <span className="mr-2 hidden font-normal text-foreground/50 sm:inline">{gregorianDate}</span>
            )}
          </span>

          {/* Shabbat/holiday times — left side in RTL, hidden on xs */}
          {hasShabbatInfo && (
            <span className="hidden truncate text-foreground/65 sm:block">
              {shabbatTimes.candleLighting && `כניסת שבת: ${shabbatTimes.candleLighting}`}
              {shabbatTimes.candleLighting && shabbatTimes.havdalah && " \u00b7 "}
              {shabbatTimes.havdalah && `יציאת שבת: ${shabbatTimes.havdalah}`}
              {shabbatTimes.parashaTitle && ` · ${shabbatTimes.parashaTitle}`}
            </span>
          )}
        </div>
      </div>

      {/* ── Main nav bar ── */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-12">
        {/* Logo + name — right side in RTL */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
          aria-label="קהילת באורך – דף הבית"
        >
          <Image
            src="/logo.jpg"
            alt="לוגו הקהילה"
            width={36}
            height={36}
            className="h-9 w-auto rounded object-contain"
            priority
          />
          <span className="hidden font-heading text-sm font-bold tracking-tight text-foreground sm:block">
            קהילת באורך
          </span>
        </Link>

        {/* Auth buttons — left side in RTL */}
        <HeaderAuthButtons />
      </div>
    </header>
  );
}
