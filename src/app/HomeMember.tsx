import Link from "next/link";
import type { DailySchedule, PrayerEvent } from "@/lib/schedule";
import { SignOutButton } from "./SignOutButton";

type Props = {
  schedule: DailySchedule;
  upcoming: PrayerEvent | undefined;
  formatTime: (d: Date) => string;
};

export function HomeMember({ schedule, upcoming, formatTime }: Props) {
  return (
    <>
      <section className="surface-card space-y-4 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
              24 שעות קדימה
            </p>
            <p className="text-sm font-medium text-foreground">
              {upcoming
                ? `האירוע הבא: ${upcoming.title} (${formatTime(
                    upcoming.start,
                  )}) – ${upcoming.location.name}`
                : "אין אירועים מתוכננים ב-24 השעות הקרובות."}
            </p>
          </div>
          <p className="text-xs text-primary/70">
            תצוגה ניסיונית של מנוע הזמנים. הערכים ניתנים להתאמה לפי מנהג
            הקהילה.
          </p>
        </div>

        <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
          {schedule.events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-1 rounded-xl border border-secondary/20 bg-secondary/5 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {event.title}
                </span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-white">
                  {formatTime(event.start)}
                </span>
              </div>
              <p className="text-[11px] text-primary/80">
                {event.location.name} · קיבולת מקסימלית{" "}
                {event.location.maxCapacity.toLocaleString("he-IL")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/directory"
          className="surface-card block p-5 transition hover:border-primary/40"
        >
          <h3 className="font-semibold text-foreground">משפחות הקהילה</h3>
          <p className="mt-1 text-sm text-primary/80">
            מדריך קהילה עם סינון תגיות ופרטיות
          </p>
        </Link>
        <Link
          href="/gmach"
          className="surface-card block p-5 transition hover:border-primary/40"
        >
          <h3 className="font-semibold text-foreground">לוח גמ״ח</h3>
          <p className="mt-1 text-sm text-primary/80">
            קטגוריות צבעוניות ועדיפות ועדה
          </p>
        </Link>
        <Link
          href="/life-events"
          className="surface-card block p-5 transition hover:border-primary/40"
        >
          <h3 className="font-semibold text-foreground">אירועי חיים</h3>
          <p className="mt-1 text-sm text-primary/80">
            ימי הולדת ואזכרות, אירועים קרובים
          </p>
        </Link>
      </section>

      <section className="mt-auto flex flex-wrap items-center justify-between gap-6 border-t border-secondary/20 pt-8">
        <div className="space-y-1">
          <p className="font-medium text-foreground">כניסה למערכת</p>
          <p className="text-sm text-primary/80">
            בקשת גישה למשק בית חדש, מסך מנהל, והתנתקות.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/request-access" className="btn-primary">
            בקשת גישה למשק בית
          </a>
          <a href="/admin/access-requests" className="btn-secondary">
            מסך אישורי מנהל
          </a>
          <SignOutButton />
        </div>
      </section>
    </>
  );
}
