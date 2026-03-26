import { buildDailyScheduleForDate } from "@/lib/schedule";
import { getLocations } from "@/lib/locations";
import { BackLink } from "@/components/BackLink";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";
import type { PrayerEvent } from "@/lib/schedule";

export const metadata = {
  title: "לוח זמנים שבועי | CommunityHub",
  description: "תפילות ושיעורים לשבוע הנוכחי",
};

export const dynamic = "force-dynamic";

const HE_WEEKDAY: Record<number, string> = {
  0: "יום ראשון",
  1: "יום שני",
  2: "יום שלישי",
  3: "יום רביעי",
  4: "יום חמישי",
  5: "יום שישי",
  6: "שבת קודש",
};

const EVENT_TYPE_BADGE: Record<string, string> = {
  shacharit: "שחרית",
  mincha: "מנחה",
  arvit: "ערבית",
  lesson: "שיעור",
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Returns the Sunday–Saturday dates of the current week (ISO week). */
function currentWeekDates(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
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

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-10 text-right">
      <BackLink />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            לוח זמנים שבועי
          </h1>
          <p className="mt-1 text-sm text-primary/70">
            תפילות ושיעורים לשבוע{" "}
            {weekDates[0].toLocaleDateString("he-IL", { day: "numeric", month: "long" })}
            {" – "}
            {weekDates[6].toLocaleDateString("he-IL", { day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {weekSchedules.map((day, idx) => {
          const today = isToday(day.date);
          const noEvents = day.events.length === 0;

          return (
            <div
              key={day.date.toISOString()}
              className={`surface-card overflow-hidden rounded-2xl ${
                today ? "ring-2 ring-primary/40" : ""
              }`}
            >
              {/* Day header */}
              <div
                className={`px-4 py-3 ${
                  today
                    ? "bg-primary/10 border-b border-primary/20"
                    : day.date.getDay() === 6
                      ? "bg-amber-50 border-b border-amber-200/60"
                      : "bg-secondary/5 border-b border-secondary/10"
                }`}
              >
                <p
                  className={`font-heading text-sm font-bold ${
                    today ? "text-primary" : "text-foreground"
                  }`}
                >
                  {HE_WEEKDAY[day.date.getDay()]}
                  {today && (
                    <span className="mr-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      היום
                    </span>
                  )}
                </p>
                <p className="text-xs text-primary/55">
                  {day.date.toLocaleDateString("he-IL", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>

              {/* Events */}
              <div className="p-3">
                {noEvents ? (
                  <p className="py-3 text-center text-xs text-primary/40">אין אירועים</p>
                ) : (
                  <ul className="space-y-2">
                    {day.events.map((ev: PrayerEvent) => (
                      <li
                        key={ev.id}
                        className="flex items-start gap-2.5 rounded-xl bg-secondary/5 px-3 py-2.5"
                      >
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
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
