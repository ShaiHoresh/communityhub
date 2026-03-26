import { buildDailyScheduleForDate } from "@/lib/schedule";
import { getLocations } from "@/lib/locations";
import { BackLink } from "@/components/BackLink";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import { formatBiDate, formatHebrewDateShort } from "@/lib/hebrew-date";
import type { PrayerEvent } from "@/lib/schedule";

export const metadata = {
  title: "לוח זמנים שבועי | CommunityHub",
  description: "תפילות ושיעורים לשבוע הנוכחי",
};

export const dynamic = "force-dynamic";

// ── Labels ───────────────────────────────────────────────────────────────────

const HE_WEEKDAY: Record<number, string> = {
  0: "יום ראשון",
  1: "יום שני",
  2: "יום שלישי",
  3: "יום רביעי",
  4: "יום חמישי",
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

function currentWeekDates(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
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

// ── Sub-components ────────────────────────────────────────────────────────────

function EventItem({ ev }: { ev: PrayerEvent }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-secondary/5 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{ev.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-primary/65">
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
      <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
        {EVENT_TYPE_BADGE[ev.type] ?? ev.type}
      </span>
    </li>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <li
      aria-hidden="true"
      className="px-1 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-primary/40"
    >
      {label}
    </li>
  );
}

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
            ? "border-primary/20 bg-primary/10"
            : "border-secondary/10 bg-secondary/5"
        }`}
      >
        <p className={`font-heading text-sm font-bold ${today ? "text-primary" : "text-foreground"}`}>
          {HE_WEEKDAY[date.getDay()]}
          {today && (
            <span className="mr-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              היום
            </span>
          )}
        </p>
        <p className="text-xs text-primary/55">{formatBiDate(date)}</p>
      </div>
      <div className="p-3">
        {events.length === 0 ? (
          <p className="py-3 text-center text-xs text-primary/40">אין אירועים</p>
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
 * The Shabbat Block — a single unified card spanning Friday evening through
 * Saturday night. Visually divided into three liturgical sections:
 *   1. ערב שבת  (erev_shabbat entries from Friday)
 *   2. שבת קודש (shabbat entries from Saturday)
 *   3. מוצאי שבת (motzei_shabbat entries from Saturday)
 */
function ShabbatBlock({
  friday,
  saturday,
  fridayEvents,
  saturdayEvents,
}: {
  friday: Date;
  saturday: Date;
  fridayEvents: PrayerEvent[];
  saturdayEvents: PrayerEvent[];
}) {
  const erevEvents = fridayEvents.filter((e) => e.dayTypes.includes("erev_shabbat"));
  const shabbatDayEvents = saturdayEvents.filter((e) => e.dayTypes.includes("shabbat"));
  const motzeiEvents = saturdayEvents.filter((e) => e.dayTypes.includes("motzei_shabbat"));

  const isFridayToday = isToday(friday);
  const isSaturdayToday = isToday(saturday);

  return (
    <div
      className={`surface-card col-span-2 overflow-hidden rounded-2xl ${
        isFridayToday || isSaturdayToday ? "ring-2 ring-amber-400/50" : ""
      }`}
    >
      {/* Shabbat header */}
      <div className="border-b border-amber-200/70 bg-gradient-to-l from-amber-50 to-yellow-50/60 px-5 py-3">
        <p className="font-heading text-base font-bold text-amber-800">✡ שבת קודש</p>
        <p className="text-xs text-amber-700/75">
          {formatHebrewDateShort(friday)} – {formatHebrewDateShort(saturday)}
          <span className="mr-1 text-amber-600/50">
            ({friday.toLocaleDateString("he-IL", { day: "numeric", month: "short" })}–
            {saturday.toLocaleDateString("he-IL", { day: "numeric", month: "short" })})
          </span>
        </p>
      </div>

      {/* Two-column layout: Erev Shabbat | Shabbat */}
      <div className="grid grid-cols-2 divide-x divide-x-reverse divide-secondary/15">
        {/* Left col: Erev Shabbat */}
        <div className="p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
            ערב שבת – יום שישי
          </p>
          {erevEvents.length === 0 ? (
            <p className="py-3 text-center text-xs text-primary/40">לא הוגדרו תפילות</p>
          ) : (
            <ul className="space-y-2">
              {erevEvents.map((ev) => (
                <EventItem key={ev.id} ev={ev} />
              ))}
            </ul>
          )}
        </div>

        {/* Right col: Shabbat day + Motzei */}
        <div className="p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-amber-700/70">
            שבת – כל היום
          </p>
          {shabbatDayEvents.length === 0 ? (
            <p className="py-3 text-center text-xs text-primary/40">לא הוגדרו תפילות</p>
          ) : (
            <ul className="space-y-2">
              {shabbatDayEvents.map((ev) => (
                <EventItem key={ev.id} ev={ev} />
              ))}
            </ul>
          )}

          {motzeiEvents.length > 0 && (
            <>
              <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-primary/40">
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

  const weekDates = currentWeekDates();

  // Build all 7 days in parallel — Next.js fetch cache deduplicates zmanim API calls per date
  const weekSchedules = await Promise.all(
    weekDates.map((d) => buildDailyScheduleForDate(d, mainLocation)),
  );

  // Separate weekday days (Sun–Thu) from the Shabbat pair (Fri+Sat)
  const weekdaySchedules = weekSchedules.filter((s) => s.date.getDay() <= 4); // Sun–Thu
  const fridaySchedule = weekSchedules.find((s) => s.date.getDay() === 5)!;
  const saturdaySchedule = weekSchedules.find((s) => s.date.getDay() === 6)!;

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-10 text-right">
      <BackLink />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            לוח זמנים שבועי
          </h1>
          <p className="mt-1 text-sm text-primary/70">
            {formatBiDate(weekDates[0])} – {formatBiDate(weekDates[6])}
          </p>
        </div>
      </div>

      {/* ── Weekdays Sun–Thu ── */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {weekdaySchedules.map((day) => (
          <DayCard
            key={day.date.toISOString()}
            date={day.date}
            events={day.events}
            today={isToday(day.date)}
          />
        ))}
      </div>

      {/* ── Shabbat Block: Friday evening → Saturday night ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ShabbatBlock
          friday={fridaySchedule.date}
          saturday={saturdaySchedule.date}
          fridayEvents={fridaySchedule.events}
          saturdayEvents={saturdaySchedule.events}
        />
      </div>
    </main>
  );
}
