import type { PrayerEvent } from "@/lib/schedule";

type Props = {
  upcoming: PrayerEvent | undefined;
  formatTime: (d: Date) => string;
};

export function HomeGuest({ upcoming, formatTime }: Props) {
  return (
    <>
      <section className="surface-card space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">
          התפילה הבאה
        </p>
        <p className="text-lg font-medium text-foreground">
          {upcoming
            ? `${upcoming.title} – ${formatTime(upcoming.start)} (${upcoming.location.name})`
            : "אין אירועים מתוכננים ב-24 השעות הקרובות."}
        </p>
      </section>

      <section className="mt-auto flex flex-col items-center gap-4 border-t border-secondary/20 pt-8">
        <p className="text-sm text-primary/80 text-center">
          להתחברות או הרשמה חדשה השתמשו בכפתורים למטה.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/auth/signin" className="btn-primary">
            התחברות
          </a>
          <a href="/auth/signup" className="btn-secondary">
            הרשמה
          </a>
        </div>
      </section>
    </>
  );
}
