import { buildDailyScheduleForDate, type DailySchedule } from "@/lib/schedule";
import { getLocations } from "@/lib/locations";
import { BackLink } from "@/components/BackLink";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import { formatBiDate, formatHebrewDateShort } from "@/lib/hebrew-date";
import { fetchHolidaysForRange, type HolidayInfo } from "@/lib/hebcal-holidays";
import type { PrayerEvent } from "@/lib/schedule";

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
 * The schedule is rendered as an ordered list of "groups":
 *   "days"    → a grid of plain weekday cards
 *   "shabbat" → the unified Fri+Sat block (friday may be absent if not in window)
 *   "holiday" → a single holiday card (Yom Tov or minor holiday)
 */
type RenderGroup =
  | { kind: "days"; schedules: DailySchedule[] }
  | {
      kind: "shabbat";
      friday?: DailySchedule;
      saturday: DailySchedule;
      fridayHoliday?: HolidayInfo;
      saturdayHoliday?: HolidayInfo;
    }
  | { kind: "holiday"; schedule: DailySchedule; info: HolidayInfo };

function buildRenderGroups(
  dates: Date[],
  schedules: DailySchedule[],
  holidays: Map<string, HolidayInfo>,
): RenderGroup[] {
  const schedMap = new Map(schedules.map((s) => [dateKey(s.date), s]));
  const groups: RenderGroup[] = [];
  let pendingDays: DailySchedule[] = [];

  const flush = () => {
    if (pendingDays.length > 0) {
      groups.push({ kind: "days", schedules: [...pendingDays] });
      pendingDays = [];
    }
  };

  let i = 0;
  while (i < dates.length) {
    const d = dates[i];
    const key = dateKey(d);
    const sched = schedMap.get(key)!;
    const dow = d.getDay();

    if (dow === 5) {
      // Friday — start a Shabbat block
      flush();
      const nextD = dates[i + 1];
      const nextKey = nextD ? dateKey(nextD) : null;
      const nextSched = nextKey ? schedMap.get(nextKey) : undefined;

      if (nextD?.getDay() === 6 && nextSched) {
        // Full Fri + Sat block
        groups.push({
          kind: "shabbat",
          friday: sched,
          saturday: nextSched,
          fridayHoliday: holidays.get(key),
          saturdayHoliday: holidays.get(nextKey!),
        });
        i += 2;
      } else {
        // Friday only in the window (Saturday falls outside the 7-day range)
        const holiday = holidays.get(key);
        if (holiday) {
          groups.push({ kind: "holiday", schedule: sched, info: holiday });
        } else {
          pendingDays.push(sched);
          flush();
        }
        i++;
      }
      continue;
    }

    if (dow === 6) {
      // Saturday without a preceding Friday (window starts on Shabbat)
      flush();
      groups.push({
        kind: "shabbat",
        saturday: sched,
        saturdayHoliday: holidays.get(key),
      });
      i++;
      continue;
    }

    // Regular weekday — check if it's a holiday
    const holiday = holidays.get(key);
    if (holiday) {
      flush();
      groups.push({ kind: "holiday", schedule: sched, info: holiday });
    } else {
      pendingDays.push(sched);
    }
    i++;
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
  return <p className="py-3 text-center text-xs text-foreground/35">אין אירועים</p>;
}

/** Plain weekday card */
function DayCard({
  date,
  events,
  today,
}: {
  date: Date;
  events: PrayerEvent[];
  today: boolean;
}) {
  return (
    <div
      className={`surface-card overflow-hidden rounded-2xl ${today ? "ring-2 ring-primary/40" : ""}`}
    >
      <div
        className={`border-b px-4 py-3 ${
          today
            ? "border-primary/20 bg-primary/10 dark:bg-primary/15"
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

/** Holiday card — teal/blue palette, similar feel to ShabbatBlock */
function HolidayCard({
  date,
  events,
  info,
  today,
}: {
  date: Date;
  events: PrayerEvent[];
  info: HolidayInfo;
  today: boolean;
}) {
  return (
    <div
      className={`surface-card overflow-hidden rounded-2xl ${
        today ? "ring-2 ring-teal-400/50" : ""
      }`}
    >
      <div className="border-b border-teal-200/60 bg-gradient-to-l from-teal-50 to-cyan-50/50 px-5 py-3 dark:from-teal-900/25 dark:to-cyan-900/10 dark:border-teal-800/30">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-heading text-sm font-bold text-teal-800 dark:text-teal-300">
              🕎 {info.title}
            </p>
            <p className="text-xs text-teal-700/70 dark:text-teal-400/60">
              {HE_WEEKDAY[date.getDay()]} · {formatBiDate(date)}
              {today && (
                <span className="mr-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  היום
                </span>
              )}
            </p>
          </div>
          {info.isYomTov && (
            <span className="shrink-0 rounded-full bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
              יום טוב
            </span>
          )}
        </div>
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
 * Shabbat block — the unified Friday-evening → Saturday-night card.
 * If the window starts on Saturday, `friday` is undefined (Saturday-only mode).
 * Holiday names are shown in the header when Shabbat coincides with a holiday.
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

  // Combined holiday names for the header (e.g. "שבת חול המועד פסח")
  const holidayNames = [fridayHoliday?.title, saturdayHoliday?.title]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) // dedupe
    .join(" · ");

  return (
    <div
      className={`surface-card overflow-hidden rounded-2xl ${
        isFridayToday || isSaturdayToday ? "ring-2 ring-amber-400/50" : ""
      }`}
    >
      {/* Shabbat header */}
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
        /* Full Fri + Sat — two-column layout */
        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-secondary/15 dark:divide-white/10">
          {/* Erev Shabbat (Friday) */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
              ערב שבת – יום שישי
            </p>
            {erevEvents.length === 0 ? (
              <EmptyDay />
            ) : (
              <ul className="space-y-2">
                {erevEvents.map((ev) => <EventItem key={ev.id} ev={ev} />)}
              </ul>
            )}
          </div>

          {/* Shabbat day + Motzei */}
          <div className="p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
              שבת – כל היום
            </p>
            {shabbatDayEvents.length === 0 ? (
              <EmptyDay />
            ) : (
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
        /* Saturday-only (window starts on Shabbat) */
        <div className="p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/60 dark:text-amber-400/50">
            שבת – כל היום
          </p>
          {shabbatDayEvents.length === 0 ? (
            <EmptyDay />
          ) : (
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

  // Fetch holidays first so schedules know to include "holiday"-tagged entries
  const holidayMap = await fetchHolidaysForRange(startDate, endDate);

  // Build all 7 daily schedules in parallel (zmanim API calls are cached per date)
  const schedules = await Promise.all(
    dates.map((d) => buildDailyScheduleForDate(d, mainLocation, holidayMap.has(dateKey(d)))),
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
                {group.schedules.map((day) => (
                  <DayCard
                    key={dateKey(day.date)}
                    date={day.date}
                    events={day.events}
                    today={isToday(day.date)}
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
              <div key={idx} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <HolidayCard
                  date={group.schedule.date}
                  events={group.schedule.events}
                  info={group.info}
                  today={isToday(group.schedule.date)}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </main>
  );
}
