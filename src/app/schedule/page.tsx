import { buildDailyScheduleForDate, type DailySchedule } from "@/lib/schedule";
import { getLocations } from "@/lib/locations";
import { BackLink } from "@/components/BackLink";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import { formatBiDate, formatHebrewDateShort } from "@/lib/hebrew-date";
import { fetchHolidaysForRange, type HolidayInfo } from "@/lib/hebcal-holidays";
import type { PrayerEvent, ScheduleOptions } from "@/lib/schedule";

export const metadata = {
  title: "לוח זמנים שבועי | קהילת באורך",
  description: "תפילות ושיעורים ל-7 הימים הקרובים",
};

export const dynamic = "force-dynamic";

// ── Constants ────────────────────────────────────────────────────────────────

const HE_WEEKDAY: Record<number, string> = {
  0: "יום ראשון",
  1: "יום שני",
  2: "יום שלישי",
  3: "יום רביעי",
  4: "יום חמישי",
  5: "יום שישי",
  6: "שבת",
};

const EVENT_TYPE_BADGE: Record<string, string> = {
  shacharit: "שחרית",
  mincha: "מנחה",
  arvit: "ערבית",
  lesson: "שיעור",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function next7Days(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

function isToday(date: Date): boolean {
  const t = new Date();
  return (
    date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear()
  );
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ── Render-group types ────────────────────────────────────────────────────────

/**
 * The schedule renders as an ordered sequence of groups:
 *   "days"    → grid of DayCards (weekday / Hol HaMoed / Rosh Chodesh / Fast Day)
 *   "shabbat" → unified Friday-evening → Saturday-night block
 *   "holiday" → unified ערב-חג → יום-טוב block (or single-day if only one is in window)
 */
type DayCardEntry = { schedule: DailySchedule; holidayInfo?: HolidayInfo };

type RenderGroup =
  | { kind: "days"; entries: DayCardEntry[] }
  | {
      kind: "shabbat";
      friday?: DailySchedule;
      saturday: DailySchedule;
      fridayHoliday?: HolidayInfo;
      saturdayHoliday?: HolidayInfo;
    }
  | {
      kind: "holiday";
      /** ערב חג day — present when an "erev" Hebcal event falls in the window */
      erev?: DailySchedule;
      /** Actual Yom Tov / holiday day — may be absent if only the erev falls in window */
      yomtov?: DailySchedule;
      erevInfo?: HolidayInfo;
      yomtovInfo?: HolidayInfo;
    };

/**
 * Walks the 7-day array and groups days into render groups.
 *
 * Rules:
 *  - Friday+Saturday → ShabbatBlock (Friday absorbed even if it's also erev-chag)
 *  - Saturday-only (window starts on Shabbat) → ShabbatBlock without Friday column
 *  - Erev Yom Tov (non-Hol-HaMoed) → paired with following Yom Tov → HolidayBlock
 *  - Standalone Yom Tov (non-Hol-HaMoed) → HolidayBlock (yomtov column only)
 *  - Hol HaMoed weekdays, Rosh Chodesh, Fast Days → DayCard with badge
 *  - Everything else → pooled into DayCard grids
 */
function buildRenderGroups(
  dates: Date[],
  schedules: DailySchedule[],
  holidays: Map<string, HolidayInfo>,
): RenderGroup[] {
  const schedMap = new Map(schedules.map((s) => [dateKey(s.date), s]));
  const groups: RenderGroup[] = [];
  let pendingDays: DayCardEntry[] = [];
  const consumed = new Set<string>();

  const flush = () => {
    if (pendingDays.length > 0) {
      groups.push({ kind: "days", entries: [...pendingDays] });
      pendingDays = [];
    }
  };

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const key = dateKey(d);

    if (consumed.has(key)) continue;

    const sched = schedMap.get(key)!;
    const dow = d.getDay();
    const holidayInfo = holidays.get(key);

    // ── Friday → ShabbatBlock (Friday takes priority even if it's also erev-chag) ──
    if (dow === 5) {
      flush();
      const nextD = dates[i + 1];
      const nextKey = nextD ? dateKey(nextD) : null;
      const nextSched = nextKey ? schedMap.get(nextKey) : undefined;

      if (nextD?.getDay() === 6 && nextSched) {
        consumed.add(nextKey!);
        groups.push({
          kind: "shabbat",
          friday: sched,
          saturday: nextSched,
          fridayHoliday: holidayInfo,
          saturdayHoliday: holidays.get(nextKey!),
        });
      } else {
        // Friday-only window edge case — show as single-day card
        pendingDays.push({ schedule: sched, holidayInfo });
        flush();
      }
      continue;
    }

    // ── Saturday (not consumed as part of a ShabbatBlock) ──
    if (dow === 6) {
      flush();
      groups.push({ kind: "shabbat", saturday: sched, saturdayHoliday: holidayInfo });
      continue;
    }

    // ── Erev Chag (NOT within Hol HaMoed): pair with following Yom Tov → HolidayBlock ──
    if (holidayInfo?.isErev && !holidayInfo.isHolHaMoed) {
      flush();
      const nextD = dates[i + 1];
      const nextKey = nextD ? dateKey(nextD) : null;
      const nextSched = nextKey ? schedMap.get(nextKey) : undefined;
      const nextInfo = nextKey ? holidays.get(nextKey) : undefined;

      // Pair only when the next day is a non-erev, non-Hol-HaMoed holiday
      if (
        nextD && nextSched && nextInfo &&
        !nextInfo.isErev && !nextInfo.isHolHaMoed &&
        !consumed.has(nextKey!)
      ) {
        consumed.add(nextKey!);
        groups.push({
          kind: "holiday",
          erev: sched,
          yomtov: nextSched,
          erevInfo: holidayInfo,
          yomtovInfo: nextInfo,
        });
      } else {
        // Erev without a following Yom Tov in the window
        groups.push({ kind: "holiday", erev: sched, erevInfo: holidayInfo });
      }
      continue;
    }

    // ── Standalone Yom Tov (not Hol HaMoed, not erev) → HolidayBlock ──
    if (holidayInfo && !holidayInfo.isErev && !holidayInfo.isHolHaMoed && holidayInfo.isYomTov) {
      flush();
      groups.push({ kind: "holiday", yomtov: sched, yomtovInfo: holidayInfo });
      continue;
    }

    // ── Everything else (weekday, Hol HaMoed, Rosh Chodesh, Fast Day, erev_chag_sheni)
    //    stays as a DayCard; special info is forwarded for badge rendering.
    pendingDays.push({ schedule: sched, holidayInfo: holidayInfo });
  }

  flush();
  return groups;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EventItem({ ev }: { ev: PrayerEvent }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-secondary/5 dark:bg-white/5 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{ev.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-foreground/55">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {formatTime(ev.start)}
          </span>
          <span className="flex items-center gap-1">
            <LocationIcon className="h-3 w-3" />
            {ev.location.name}
          </span>
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent dark:text-violet-300 dark:bg-violet-900/30">
        {EVENT_TYPE_BADGE[ev.type] ?? ev.type}
      </span>
    </li>
  );
}

function EmptyDay() {
  return <p className="py-3 text-center text-xs text-foreground/35">אין אירועים מוגדרים</p>;
}

/**
 * Visual badges shown on DayCard headers for special day states.
 * Hol HaMoed, Rosh Chodesh, Fast Days and Erev Chag Sheni all get
 * a colored pill rather than a full HolidayBlock.
 */
function DayStateBadges({ info }: { info: HolidayInfo }) {
  const badges: { label: string; cls: string }[] = [];

  if (info.isHolHaMoed && info.isErevChagSheni) {
    badges.push({ label: info.title || "הושנא רבא / ערב חג שני", cls: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" });
  } else if (info.isHolHaMoed) {
    badges.push({ label: "חול המועד", cls: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" });
  } else if (info.isErev) {
    badges.push({ label: "ערב חג שני", cls: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" });
  }

  if (info.isRoshChodesh) {
    badges.push({ label: "ראש חודש", cls: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" });
  }

  if (info.isFastDay) {
    badges.push({ label: "יום תענית", cls: "bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300" });
  }

  if (badges.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {badges.map((b) => (
        <span key={b.label} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.cls}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

/** Weekday card — also used for Hol HaMoed, Rosh Chodesh, Fast Days */
function DayCard({
  date,
  events,
  today,
  holidayInfo,
}: {
  date: Date;
  events: PrayerEvent[];
  today: boolean;
  holidayInfo?: HolidayInfo;
}) {
  const isHolHaMoed = holidayInfo?.isHolHaMoed ?? false;
  const isFastDay   = holidayInfo?.isFastDay   ?? false;

  // Ring color: teal for Hol HaMoed, slate for fast, primary for today
  const ringCls = today
    ? "ring-2 ring-primary/40"
    : isHolHaMoed
      ? "ring-1 ring-teal-300/50 dark:ring-teal-600/40"
      : isFastDay
        ? "ring-1 ring-slate-300/60 dark:ring-slate-600/40"
        : "";

  return (
    <div className={`surface-card overflow-hidden rounded-2xl ${ringCls}`}>
      <div
        className={`border-b px-4 py-3 ${
          today
            ? "border-primary/20 bg-primary/10 dark:bg-primary/15"
            : isHolHaMoed
              ? "border-teal-200/60 bg-teal-50/50 dark:bg-teal-900/10 dark:border-teal-800/20"
              : isFastDay
                ? "border-slate-200/60 bg-slate-50/60 dark:bg-slate-800/20 dark:border-slate-700/20"
                : "border-secondary/10 bg-secondary/5 dark:bg-white/5"
        }`}
      >
        <p className={`font-heading text-sm font-bold ${today ? "text-primary dark:text-violet-300" : "text-foreground"}`}>
          {HE_WEEKDAY[date.getDay()]}
          {today && (
            <span className="mr-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary dark:text-violet-300">
              היום
            </span>
          )}
        </p>
        <p className="text-xs text-foreground/50">{formatBiDate(date)}</p>
        {holidayInfo && <DayStateBadges info={holidayInfo} />}
      </div>
      <div className="p-3">
        {events.length === 0 ? <EmptyDay /> : (
          <ul className="space-y-2">
            {events.map((ev) => <EventItem key={ev.id} ev={ev} />)}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Holiday block — two-column when both ערב-חג and יום-טוב are available,
 * single-column when only one side is in the window.
 * Visually mirrors the ShabbatBlock but uses a teal palette.
 */
function HolidayBlock({
  erev,
  yomtov,
  erevInfo,
  yomtovInfo,
}: {
  erev?: DailySchedule;
  yomtov?: DailySchedule;
  erevInfo?: HolidayInfo;
  yomtovInfo?: HolidayInfo;
}) {
  const isTwoColumn = !!(erev && yomtov);
  const isErevToday = erev ? isToday(erev.date) : false;
  const isYomTovToday = yomtov ? isToday(yomtov.date) : false;

  // Header title: prefer the yomtov name; fall back to erev name
  const primaryName = yomtovInfo?.title ?? erevInfo?.title ?? "";
  // Date range label
  const dateRange = (() => {
    if (erev && yomtov) {
      return `${formatHebrewDateShort(erev.date)} – ${formatHebrewDateShort(yomtov.date)}`;
    }
    const d = (erev ?? yomtov)!.date;
    return formatHebrewDateShort(d);
  })();

  return (
    <div
      className={`surface-card overflow-hidden rounded-2xl ${
        isErevToday || isYomTovToday ? "ring-2 ring-teal-400/50" : ""
      }`}
    >
      {/* Header */}
      <div className="border-b border-teal-200/70 bg-gradient-to-l from-teal-50 to-cyan-50/60 px-5 py-3 dark:from-teal-900/25 dark:to-cyan-900/10 dark:border-teal-800/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-base font-bold text-teal-800 dark:text-teal-300">
              🕎 {primaryName}
            </p>
            <p className="text-xs text-teal-700/65 dark:text-teal-400/60">{dateRange}</p>
          </div>
          {(yomtovInfo?.isYomTov) && (
            <span className="shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
              יום טוב
            </span>
          )}
        </div>
      </div>

      {isTwoColumn ? (
        /* ── Two-column layout: ערב חג | יום טוב ── */
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-secondary/15 dark:divide-white/10">
          {/* Left (RTL): ערב חג */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-700/60 dark:text-teal-400/50">
              ערב חג – {HE_WEEKDAY[erev!.date.getDay()]}
              {isErevToday && (
                <span className="mr-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 dark:text-teal-300">
                  היום
                </span>
              )}
            </p>
            {erev!.events.length === 0 ? <EmptyDay /> : (
              <ul className="space-y-2">
                {erev!.events.map((ev) => <EventItem key={ev.id} ev={ev} />)}
              </ul>
            )}
          </div>

          {/* Right (RTL): יום טוב */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-700/60 dark:text-teal-400/50">
              {yomtovInfo?.title ?? "יום טוב"}
              {isYomTovToday && (
                <span className="mr-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 dark:text-teal-300">
                  היום
                </span>
              )}
            </p>
            {yomtov!.events.length === 0 ? <EmptyDay /> : (
              <ul className="space-y-2">
                {yomtov!.events.map((ev) => <EventItem key={ev.id} ev={ev} />)}
              </ul>
            )}
          </div>
        </div>
      ) : (
        /* ── Single-column: whichever side is available ── */
        <div className="p-4">
          {(() => {
            const day = erev ?? yomtov!;
            const label = erev
              ? `ערב חג – ${HE_WEEKDAY[day.date.getDay()]}`
              : (yomtovInfo?.title ?? "יום טוב");
            const dayIsToday = isToday(day.date);
            return (
              <>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-700/60 dark:text-teal-400/50">
                  {label}
                  {dayIsToday && (
                    <span className="mr-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 dark:text-teal-300">
                      היום
                    </span>
                  )}
                </p>
                {day.events.length === 0 ? <EmptyDay /> : (
                  <ul className="space-y-2">
                    {day.events.map((ev) => <EventItem key={ev.id} ev={ev} />)}
                  </ul>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/**
 * Shabbat block — unified Friday-evening → Saturday-night card.
 * Shows holiday decoration when Shabbat coincides with a holiday.
 */
function ShabbatBlock({
  friday,
  saturday,
  fridayEvents,
  saturdayEvents,
  fridayHoliday,
  saturdayHoliday,
}: {
  friday?: Date;
  saturday: Date;
  fridayEvents: PrayerEvent[];
  saturdayEvents: PrayerEvent[];
  fridayHoliday?: HolidayInfo;
  saturdayHoliday?: HolidayInfo;
}) {
  const erevEvents = fridayEvents.filter((e) => e.dayTypes.includes("erev_shabbat"));
  const shabbatDayEvents = saturdayEvents.filter((e) => e.dayTypes.includes("shabbat"));
  const motzeiEvents = saturdayEvents.filter((e) => e.dayTypes.includes("motzei_shabbat"));

  const isFridayToday = friday ? isToday(friday) : false;
  const isSaturdayToday = isToday(saturday);

  const holidayNames = [fridayHoliday?.title, saturdayHoliday?.title]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(" · ");

  return (
    <div
      className={`surface-card overflow-hidden rounded-2xl ${
        isFridayToday || isSaturdayToday ? "ring-2 ring-amber-400/50" : ""
      }`}
    >
      {/* Header */}
      <div className="border-b border-amber-200/70 bg-gradient-to-l from-amber-50 to-yellow-50/60 px-5 py-3 dark:from-amber-900/20 dark:to-yellow-900/10 dark:border-amber-800/30">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-base font-bold text-amber-800 dark:text-amber-300">
              ✡ שבת קודש
              {holidayNames && (
                <span className="mr-2 text-sm font-normal text-amber-700/75 dark:text-amber-400/70">
                  · {holidayNames}
                </span>
              )}
            </p>
            <p className="text-xs text-amber-700/65 dark:text-amber-400/60">
              {friday ? (
                <>
                  {formatHebrewDateShort(friday)} – {formatHebrewDateShort(saturday)}
                  <span className="mr-1 text-amber-600/50 dark:text-amber-500/40">
                    ({friday.toLocaleDateString("he-IL", { day: "numeric", month: "short" })}–
                    {saturday.toLocaleDateString("he-IL", { day: "numeric", month: "short" })})
                  </span>
                </>
              ) : (
                <>
                  {formatHebrewDateShort(saturday)}
                  <span className="mr-1 text-amber-600/50 dark:text-amber-500/40">
                    ({saturday.toLocaleDateString("he-IL", { day: "numeric", month: "short" })})
                  </span>
                </>
              )}
            </p>
          </div>
          {(fridayHoliday?.isYomTov || saturdayHoliday?.isYomTov) && (
            <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              יום טוב
            </span>
          )}
        </div>
      </div>

      {friday ? (
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-secondary/15 dark:divide-white/10">
          {/* ערב שבת column */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
              ערב שבת – יום שישי
              {isFridayToday && (
                <span className="mr-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                  היום
                </span>
              )}
            </p>
            {erevEvents.length === 0 ? <EmptyDay /> : (
              <ul className="space-y-2">
                {erevEvents.map((ev) => <EventItem key={ev.id} ev={ev} />)}
              </ul>
            )}
          </div>

          {/* שבת + מוצאי column */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
              שבת – כל היום
              {isSaturdayToday && (
                <span className="mr-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                  היום
                </span>
              )}
            </p>
            {shabbatDayEvents.length === 0 ? <EmptyDay /> : (
              <ul className="space-y-2">
                {shabbatDayEvents.map((ev) => <EventItem key={ev.id} ev={ev} />)}
              </ul>
            )}
            {motzeiEvents.length > 0 && (
              <>
                <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-foreground/35">
                  מוצאי שבת
                </p>
                <ul className="space-y-2">
                  {motzeiEvents.map((ev) => <EventItem key={ev.id} ev={ev} />)}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Saturday-only */
        <div className="p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
            שבת – כל היום
            {isSaturdayToday && (
              <span className="mr-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                היום
              </span>
            )}
          </p>
          {shabbatDayEvents.length === 0 ? <EmptyDay /> : (
            <ul className="space-y-2">
              {shabbatDayEvents.map((ev) => <EventItem key={ev.id} ev={ev} />)}
            </ul>
          )}
          {motzeiEvents.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-foreground/35">
                מוצאי שבת
              </p>
              <ul className="space-y-2">
                {motzeiEvents.map((ev) => <EventItem key={ev.id} ev={ev} />)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SchedulePage() {
  const locations = await getLocations();
  const mainLocation = locations[0];

  if (!mainLocation) {
    return (
      <main id="main-content" className="mx-auto max-w-4xl px-6 py-10 text-right">
        <BackLink />
        <div className="surface-card rounded-2xl p-10 text-center">
          <p className="font-medium text-foreground">לא הוגדרו מיקומים עדיין.</p>
        </div>
      </main>
    );
  }

  const dates = next7Days();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  // Fetch holidays first — needed to pass correct options to buildDailyScheduleForDate
  const holidayMap = await fetchHolidaysForRange(startDate, endDate);

  // Build all 7 daily schedules in parallel with correct day-type flags.
  // Exclusive overrides (isHoliday / isErevChag) apply only to standalone Yom Tov
  // or Erev Yom Tov — NOT to Hol HaMoed days, which keep their weekday base type.
  const schedules = await Promise.all(
    dates.map((d) => {
      const key = dateKey(d);
      const info = holidayMap.get(key);
      const dow = d.getDay();

      const opts: ScheduleOptions = {};

      if (info) {
        const isStandaloneYomTov = info.isYomTov && !info.isHolHaMoed;
        const isStandaloneErev   = info.isErev   && !info.isHolHaMoed;

        if (isStandaloneYomTov)        opts.isHoliday   = true;
        else if (isStandaloneErev)     opts.isErevChag  = true;

        if (info.isRoshChodesh)        opts.isRoshChodesh         = true;
        if (info.isFastDay)            opts.isFastDay             = true;
        if (info.isHolHaMoed)          opts.isHolHaMoed           = true;
        if (info.isErevChagSheni)      opts.isErevChagSheni       = true;
        // Friday in Hol HaMoed
        if (info.isHolHaMoed && dow === 5) opts.isErevShabbatHolHaMoed = true;
      }

      return buildDailyScheduleForDate(d, mainLocation, opts);
    }),
  );

  const renderGroups = buildRenderGroups(dates, schedules, holidayMap);

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-10 text-right">
      <BackLink />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            לוח זמנים – 7 ימים קדימה
          </h1>
          <p className="mt-1 text-sm text-foreground/60">
            {formatBiDate(startDate)} – {formatBiDate(endDate)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {renderGroups.map((group, idx) => {
          if (group.kind === "days") {
            return (
              <div key={idx} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.entries.map(({ schedule: day, holidayInfo }) => (
                  <DayCard
                    key={dateKey(day.date)}
                    date={day.date}
                    events={day.events}
                    today={isToday(day.date)}
                    holidayInfo={holidayInfo}
                  />
                ))}
              </div>
            );
          }

          if (group.kind === "shabbat") {
            return (
              <ShabbatBlock
                key={idx}
                friday={group.friday?.date}
                saturday={group.saturday.date}
                fridayEvents={group.friday?.events ?? []}
                saturdayEvents={group.saturday.events}
                fridayHoliday={group.fridayHoliday}
                saturdayHoliday={group.saturdayHoliday}
              />
            );
          }

          if (group.kind === "holiday") {
            return (
              <HolidayBlock
                key={idx}
                erev={group.erev}
                yomtov={group.yomtov}
                erevInfo={group.erevInfo}
                yomtovInfo={group.yomtovInfo}
              />
            );
          }

          return null;
        })}
      </div>
    </main>
  );
}
