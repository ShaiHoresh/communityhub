import { buildDailyScheduleForDate, type DailySchedule } from "@/lib/schedule";
import { getLocations } from "@/lib/locations";
import { BackLink } from "@/components/BackLink";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import { formatBiDate, formatHebrewDateShort } from "@/lib/hebrew-date";
import { fetchHolidaysForRange, type HolidayInfo } from "@/lib/hebcal-holidays";
import type { PrayerEvent, PrayerType, ScheduleOptions } from "@/lib/schedule";

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

const EVENT_TYPE_LABEL: Record<string, string> = {
  shacharit: "שחרית",
  mincha: "מנחה",
  arvit: "ערבית",
  lesson: "שיעור",
};

/** Tailwind classes for each prayer-type badge */
const TYPE_BADGE_CLS: Record<string, string> = {
  shacharit:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  mincha:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  arvit:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  lesson:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
 *
 *   "days"        → one or more DayCards (today's standalone card, special-only days)
 *   "weekoverview"→ WeeklyOverview (compressed regular weekdays) +
 *                   compact exception DayCards (Rosh Chodesh / Fast / Hol HaMoed)
 *   "shabbat"     → unified Friday-evening → Saturday-night block
 *   "holiday"     → unified ערב-חג → יום-טוב block
 */
type DayCardEntry = { schedule: DailySchedule; holidayInfo?: HolidayInfo };

type RenderGroup =
  | { kind: "days"; entries: DayCardEntry[] }
  | {
      kind: "weekoverview";
      /** Regular (no-special-state) weekdays to compress */
      regular: DayCardEntry[];
      /** Special-state weekdays (Rosh Chodesh, Fast Day, Hol HaMoed) shown as side cards */
      exceptions: DayCardEntry[];
    }
  | {
      kind: "shabbat";
      friday?: DailySchedule;
      saturday: DailySchedule;
      fridayHoliday?: HolidayInfo;
      saturdayHoliday?: HolidayInfo;
    }
  | {
      kind: "holiday";
      erev?: DailySchedule;
      yomtov?: DailySchedule;
      erevInfo?: HolidayInfo;
      yomtovInfo?: HolidayInfo;
    };

// ── Compressed-schedule helpers ───────────────────────────────────────────────

/** A day has a "special state" when it carries Rosh Chodesh / fast / Hol HaMoed. */
function hasSpecialState(entry: DayCardEntry): boolean {
  const info = entry.holidayInfo;
  return !!(info && (info.isRoshChodesh || info.isFastDay || info.isHolHaMoed));
}

/** A single prayer entry after compressing across multiple regular weekdays. */
type CompressedEvent = {
  id: string;
  title: string;
  type: PrayerType;
  locationName: string;
  /** Median clock time across regular days — the "typical" time shown for all days. */
  canonicalTime: Date;
  /**
   * Regular-weekday occurrences whose time differs from the canonical by more
   * than 5 minutes.  Shown as inline exceptions in the WeeklyOverview.
   */
  exceptions: { dayName: string; date: Date; time: Date }[];
};

/**
 * Groups prayer events across `regular` weekdays by schedule-entry ID, picks
 * the median time as the canonical for each, and flags per-day deviations
 * larger than 5 minutes as inline exceptions.
 */
function compressEvents(regular: DayCardEntry[]): CompressedEvent[] {
  if (regular.length === 0) return [];

  // Gather all occurrences of each schedule-entry across the regular days.
  const byId = new Map<string, Array<{ ev: PrayerEvent; date: Date }>>();
  for (const { schedule } of regular) {
    for (const ev of schedule.events) {
      if (!byId.has(ev.id)) byId.set(ev.id, []);
      byId.get(ev.id)!.push({ ev, date: schedule.date });
    }
  }

  const result: CompressedEvent[] = [];

  for (const [id, items] of byId) {
    // Sort occurrences by HH:MM and take the median as canonical.
    const byTime = [...items].sort(
      (a, b) =>
        a.ev.start.getHours() * 60 +
        a.ev.start.getMinutes() -
        (b.ev.start.getHours() * 60 + b.ev.start.getMinutes()),
    );
    const canonical = byTime[Math.floor(byTime.length / 2)].ev.start;
    const canonMin =
      canonical.getHours() * 60 + canonical.getMinutes();

    const exceptions = items
      .filter(({ ev }) => {
        const m = ev.start.getHours() * 60 + ev.start.getMinutes();
        return Math.abs(m - canonMin) > 5;
      })
      .map(({ ev, date }) => ({
        dayName: HE_WEEKDAY[date.getDay()],
        date,
        time: ev.start,
      }));

    result.push({
      id,
      title: items[0].ev.title,
      type: items[0].ev.type,
      locationName: items[0].ev.location.name,
      canonicalTime: canonical,
      exceptions,
    });
  }

  // Sort by canonical time ascending.
  return result.sort(
    (a, b) =>
      a.canonicalTime.getHours() * 60 +
      a.canonicalTime.getMinutes() -
      (b.canonicalTime.getHours() * 60 + b.canonicalTime.getMinutes()),
  );
}

// ── Group builder ─────────────────────────────────────────────────────────────

/**
 * Walks the 7-day array and groups days into render groups.
 *
 * Rules:
 *  - Friday+Saturday → ShabbatBlock
 *  - Saturday-only   → ShabbatBlock (no Friday column)
 *  - Erev Yom Tov (non-Hol-HaMoed) → paired with following Yom Tov → HolidayBlock
 *  - Standalone Yom Tov → HolidayBlock (yomtov only)
 *  - Today (regular weekday) → standalone DayCard (always emitted first)
 *  - 2+ regular weekdays (non-today) → WeeklyOverview
 *  - Special-state weekdays (Rosh Chodesh / Fast / Hol HaMoed) → Exception Cards
 *    displayed alongside the WeeklyOverview
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
    if (pendingDays.length === 0) return;

    // Split: today | regular (no special state) | exceptions (special state)
    const todayEntry = pendingDays.find((e) => isToday(e.schedule.date));
    const others = pendingDays.filter((e) => !isToday(e.schedule.date));
    const regular = others.filter((e) => !hasSpecialState(e));
    const exceptions = others.filter((e) => hasSpecialState(e));

    // Today always gets its own prominent card.
    if (todayEntry) {
      groups.push({ kind: "days", entries: [todayEntry] });
    }

    // Compress 2+ regular weekdays into a WeeklyOverview;
    // or use a WeeklyOverview even for 1 regular day when there are exceptions
    // alongside it (so the side-by-side layout is preserved).
    if (regular.length >= 2 || (regular.length === 1 && exceptions.length >= 1)) {
      groups.push({ kind: "weekoverview", regular, exceptions });
    } else if (regular.length === 1) {
      // Single lone regular day (non-today): a plain DayCard is cleaner.
      groups.push({ kind: "days", entries: regular });
      if (exceptions.length > 0) {
        groups.push({ kind: "days", entries: exceptions });
      }
    } else if (exceptions.length > 0) {
      groups.push({ kind: "days", entries: exceptions });
    }

    pendingDays = [];
  };

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const key = dateKey(d);
    if (consumed.has(key)) continue;

    const sched = schedMap.get(key)!;
    const dow = d.getDay();
    const holidayInfo = holidays.get(key);

    // ── Friday → ShabbatBlock ─────────────────────────────────────────────────
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
        pendingDays.push({ schedule: sched, holidayInfo });
        flush();
      }
      continue;
    }

    // ── Saturday (not consumed with Friday) ───────────────────────────────────
    if (dow === 6) {
      flush();
      groups.push({
        kind: "shabbat",
        saturday: sched,
        saturdayHoliday: holidayInfo,
      });
      continue;
    }

    // ── Erev Chag (not Hol HaMoed): pair with following Yom Tov ──────────────
    if (holidayInfo?.isErev && !holidayInfo.isHolHaMoed) {
      flush();
      const nextD = dates[i + 1];
      const nextKey = nextD ? dateKey(nextD) : null;
      const nextSched = nextKey ? schedMap.get(nextKey) : undefined;
      const nextInfo = nextKey ? holidays.get(nextKey) : undefined;

      if (
        nextD &&
        nextSched &&
        nextInfo &&
        !nextInfo.isErev &&
        !nextInfo.isHolHaMoed &&
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
        groups.push({ kind: "holiday", erev: sched, erevInfo: holidayInfo });
      }
      continue;
    }

    // ── Standalone Yom Tov (not Hol HaMoed, not erev) → HolidayBlock ─────────
    if (
      holidayInfo &&
      !holidayInfo.isErev &&
      !holidayInfo.isHolHaMoed &&
      holidayInfo.isYomTov
    ) {
      flush();
      groups.push({
        kind: "holiday",
        yomtov: sched,
        yomtovInfo: holidayInfo,
      });
      continue;
    }

    // ── Everything else: weekday, Hol HaMoed, Rosh Chodesh, Fast Day ─────────
    pendingDays.push({ schedule: sched, holidayInfo });
  }

  flush();
  return groups;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Colored pill badge for prayer/lesson type. */
function TypeBadge({ type }: { type: string }) {
  const cls =
    TYPE_BADGE_CLS[type] ??
    "bg-secondary/15 text-secondary dark:bg-white/10 dark:text-white/60";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}
    >
      {EVENT_TYPE_LABEL[type] ?? type}
    </span>
  );
}

/** Single prayer/lesson row used inside DayCards and the ShabbatBlock. */
function EventItem({ ev }: { ev: PrayerEvent }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-secondary/5 px-3 py-2.5 dark:bg-white/5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{ev.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-foreground/45">
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
      <TypeBadge type={ev.type} />
    </li>
  );
}

function EmptyDay() {
  return (
    <p className="py-3 text-center text-xs text-foreground/35">
      אין אירועים מוגדרים
    </p>
  );
}

/**
 * Visual badges shown on DayCard headers for special day states.
 */
function DayStateBadges({ info }: { info: HolidayInfo }) {
  const badges: { label: string; cls: string }[] = [];

  if (info.isHolHaMoed && info.isErevChagSheni) {
    badges.push({
      label: info.title || "הושנא רבא / ערב חג שני",
      cls: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    });
  } else if (info.isHolHaMoed) {
    badges.push({
      label: "חול המועד",
      cls: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    });
  } else if (info.isErev) {
    badges.push({
      label: "ערב חג שני",
      cls: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    });
  }

  if (info.isRoshChodesh) {
    badges.push({
      label: "ראש חודש",
      cls: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    });
  }

  if (info.isFastDay) {
    badges.push({
      label: "יום תענית",
      cls: "bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
    });
  }

  if (badges.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${b.cls}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

/** Weekday card — also used for Hol HaMoed, Rosh Chodesh, Fast Days and exception cards. */
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
  const isFastDay = holidayInfo?.isFastDay ?? false;

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
        <p
          className={`font-heading text-sm font-bold ${today ? "text-primary dark:text-violet-300" : "text-foreground"}`}
        >
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
        {events.length === 0 ? (
          <EmptyDay />
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <EventItem key={ev.id} ev={ev} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Consolidated weekday overview card.
 *
 * Compresses 2–5 regular (non-special, non-today) weekdays into a single card.
 * Each prayer row shows the canonical (median) time; days that deviate by more
 * than 5 minutes are listed inline as exceptions.
 */
function WeeklyOverview({ regular }: { regular: DayCardEntry[] }) {
  const compressed = compressEvents(regular);
  const hasToday = regular.some(({ schedule }) => isToday(schedule.date));

  const dayNamesLabel = regular
    .map(({ schedule }) => HE_WEEKDAY[schedule.date.getDay()])
    .join(" · ");

  return (
    <div className="surface-card min-w-0 flex-1 overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="border-b border-secondary/10 bg-secondary/5 px-5 py-3 dark:border-white/8 dark:bg-white/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-heading text-base font-bold text-foreground">
              לו״ז ימי חול
            </p>
            <p className="mt-0.5 text-xs text-foreground/50">{dayNamesLabel}</p>
          </div>
          {hasToday && (
            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary dark:text-violet-300">
              כולל היום
            </span>
          )}
        </div>
      </div>

      {/* Prayer rows */}
      <div className="divide-y divide-secondary/8 dark:divide-white/5">
        {compressed.length === 0 ? (
          <div className="p-4">
            <EmptyDay />
          </div>
        ) : (
          compressed.map((ce) => (
            <div
              key={ce.id}
              className="flex items-start gap-4 px-5 py-3.5"
            >
              {/* Details (right side in RTL) */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {ce.title}
                  </span>
                  <TypeBadge type={ce.type} />
                </div>
                {/* Location — small and muted */}
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground/40">
                  <LocationIcon className="h-3 w-3 shrink-0" />
                  {ce.locationName}
                </p>
                {/* Inline time exceptions */}
                {ce.exceptions.map((exc) => (
                  <p
                    key={exc.date.toISOString()}
                    className="mt-0.5 text-[11px] text-foreground/55"
                  >
                    <span className="ml-0.5 text-amber-500">•</span>{" "}
                    {exc.dayName}: {formatTime(exc.time)}
                  </p>
                ))}
              </div>

              {/* Canonical time — large and prominent (left side in RTL) */}
              <div className="shrink-0 font-mono text-xl font-bold tabular-nums text-foreground/85">
                {formatTime(ce.canonicalTime)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Holiday block — two-column when both ערב-חג and יום-טוב are available,
 * single-column otherwise.
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

  const primaryName = yomtovInfo?.title ?? erevInfo?.title ?? "";
  const dateRange = (() => {
    if (erev && yomtov) {
      return `${formatHebrewDateShort(erev.date)} – ${formatHebrewDateShort(yomtov.date)}`;
    }
    return formatHebrewDateShort((erev ?? yomtov)!.date);
  })();

  return (
    <div
      className={`surface-card overflow-hidden rounded-2xl ${
        isErevToday || isYomTovToday ? "ring-2 ring-teal-400/50" : ""
      }`}
    >
      {/* Header */}
      <div className="border-b border-teal-200/70 bg-gradient-to-l from-teal-50 to-cyan-50/60 px-5 py-3 dark:border-teal-800/30 dark:from-teal-900/25 dark:to-cyan-900/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-base font-bold text-teal-800 dark:text-teal-300">
              🕎 {primaryName}
            </p>
            <p className="text-xs text-teal-700/65 dark:text-teal-400/60">
              {dateRange}
            </p>
          </div>
          {yomtovInfo?.isYomTov && (
            <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              יום טוב
            </span>
          )}
        </div>
      </div>

      {isTwoColumn ? (
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-secondary/15 dark:divide-white/10">
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-700/60 dark:text-teal-400/50">
              ערב חג – {HE_WEEKDAY[erev!.date.getDay()]}
              {isErevToday && (
                <span className="mr-1.5 rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                  היום
                </span>
              )}
            </p>
            {erev!.events.length === 0 ? (
              <EmptyDay />
            ) : (
              <ul className="space-y-2">
                {erev!.events.map((ev) => (
                  <EventItem key={ev.id} ev={ev} />
                ))}
              </ul>
            )}
          </div>
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-700/60 dark:text-teal-400/50">
              {yomtovInfo?.title ?? "יום טוב"}
              {isYomTovToday && (
                <span className="mr-1.5 rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                  היום
                </span>
              )}
            </p>
            {yomtov!.events.length === 0 ? (
              <EmptyDay />
            ) : (
              <ul className="space-y-2">
                {yomtov!.events.map((ev) => (
                  <EventItem key={ev.id} ev={ev} />
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
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
                    <span className="mr-1.5 rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                      היום
                    </span>
                  )}
                </p>
                {day.events.length === 0 ? (
                  <EmptyDay />
                ) : (
                  <ul className="space-y-2">
                    {day.events.map((ev) => (
                      <EventItem key={ev.id} ev={ev} />
                    ))}
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
 * Shows holiday decoration when Shabbat coincides with a Yom Tov.
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
  const erevEvents = fridayEvents.filter((e) =>
    e.dayTypes.includes("erev_shabbat"),
  );
  const shabbatDayEvents = saturdayEvents.filter((e) =>
    e.dayTypes.includes("shabbat"),
  );
  const motzeiEvents = saturdayEvents.filter((e) =>
    e.dayTypes.includes("motzei_shabbat"),
  );

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
      <div className="border-b border-amber-200/70 bg-gradient-to-l from-amber-50 to-yellow-50/60 px-5 py-3 dark:border-amber-800/30 dark:from-amber-900/20 dark:to-yellow-900/10">
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
                  {formatHebrewDateShort(friday)} –{" "}
                  {formatHebrewDateShort(saturday)}
                  <span className="mr-1 text-amber-600/50 dark:text-amber-500/40">
                    (
                    {friday.toLocaleDateString("he-IL", {
                      day: "numeric",
                      month: "short",
                    })}
                    –
                    {saturday.toLocaleDateString("he-IL", {
                      day: "numeric",
                      month: "short",
                    })}
                    )
                  </span>
                </>
              ) : (
                <>
                  {formatHebrewDateShort(saturday)}
                  <span className="mr-1 text-amber-600/50 dark:text-amber-500/40">
                    (
                    {saturday.toLocaleDateString("he-IL", {
                      day: "numeric",
                      month: "short",
                    })}
                    )
                  </span>
                </>
              )}
            </p>
          </div>
          {(fridayHoliday?.isYomTov || saturdayHoliday?.isYomTov) && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              יום טוב
            </span>
          )}
        </div>
      </div>

      {friday ? (
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-secondary/15 dark:divide-white/10">
          {/* ערב שבת */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
              ערב שבת – יום שישי
              {isFridayToday && (
                <span className="mr-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  היום
                </span>
              )}
            </p>
            {erevEvents.length === 0 ? (
              <EmptyDay />
            ) : (
              <ul className="space-y-2">
                {erevEvents.map((ev) => (
                  <EventItem key={ev.id} ev={ev} />
                ))}
              </ul>
            )}
          </div>

          {/* שבת + מוצאי */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
              שבת – כל היום
              {isSaturdayToday && (
                <span className="mr-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  היום
                </span>
              )}
            </p>
            {shabbatDayEvents.length === 0 ? (
              <EmptyDay />
            ) : (
              <ul className="space-y-2">
                {shabbatDayEvents.map((ev) => (
                  <EventItem key={ev.id} ev={ev} />
                ))}
              </ul>
            )}
            {motzeiEvents.length > 0 && (
              <>
                <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-foreground/35">
                  מוצאי שבת
                </p>
                <ul className="space-y-2">
                  {motzeiEvents.map((ev) => (
                    <EventItem key={ev.id} ev={ev} />
                  ))}
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
              <span className="mr-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                היום
              </span>
            )}
          </p>
          {shabbatDayEvents.length === 0 ? (
            <EmptyDay />
          ) : (
            <ul className="space-y-2">
              {shabbatDayEvents.map((ev) => (
                <EventItem key={ev.id} ev={ev} />
              ))}
            </ul>
          )}
          {motzeiEvents.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-foreground/35">
                מוצאי שבת
              </p>
              <ul className="space-y-2">
                {motzeiEvents.map((ev) => (
                  <EventItem key={ev.id} ev={ev} />
                ))}
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
      <main
        id="main-content"
        className="mx-auto max-w-4xl px-6 py-10 text-right"
      >
        <BackLink />
        <div className="surface-card rounded-2xl p-10 text-center">
          <p className="font-medium text-foreground">
            לא הוגדרו מיקומים עדיין.
          </p>
        </div>
      </main>
    );
  }

  const dates = next7Days();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const holidayMap = await fetchHolidaysForRange(startDate, endDate);

  const schedules = await Promise.all(
    dates.map((d) => {
      const key = dateKey(d);
      const info = holidayMap.get(key);
      const dow = d.getDay();

      const opts: ScheduleOptions = {};
      if (info) {
        const isStandaloneYomTov = info.isYomTov && !info.isHolHaMoed;
        const isStandaloneErev = info.isErev && !info.isHolHaMoed;

        if (isStandaloneYomTov) opts.isHoliday = true;
        else if (isStandaloneErev) opts.isErevChag = true;

        if (info.isRoshChodesh) opts.isRoshChodesh = true;
        if (info.isFastDay) opts.isFastDay = true;
        if (info.isHolHaMoed) opts.isHolHaMoed = true;
        if (info.isErevChagSheni) opts.isErevChagSheni = true;
        if (info.isHolHaMoed && dow === 5) opts.isErevShabbatHolHaMoed = true;
      }

      return buildDailyScheduleForDate(d, mainLocation, opts);
    }),
  );

  const renderGroups = buildRenderGroups(dates, schedules, holidayMap);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-5xl px-6 py-10 text-right"
    >
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
          // ── Today card / fallback day cards ──────────────────────────────
          if (group.kind === "days") {
            return (
              <div
                key={idx}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
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

          // ── Weekly overview + exception side-cards ────────────────────────
          if (group.kind === "weekoverview") {
            return (
              <div
                key={idx}
                className="flex flex-col gap-4 lg:flex-row lg:items-start"
              >
                <WeeklyOverview regular={group.regular} />
                {group.exceptions.length > 0 && (
                  <div className="flex shrink-0 flex-col gap-4 lg:w-60">
                    {group.exceptions.map(({ schedule: day, holidayInfo }) => (
                      <DayCard
                        key={dateKey(day.date)}
                        date={day.date}
                        events={day.events}
                        today={isToday(day.date)}
                        holidayInfo={holidayInfo}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // ── Shabbat block ─────────────────────────────────────────────────
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

          // ── Holiday block ─────────────────────────────────────────────────
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
