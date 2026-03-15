import type { PrayerEvent } from "@/lib/schedule";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";

type Props = {
  upcoming: PrayerEvent | undefined;
  formatTime: (d: Date) => string;
};

export function HomeGuest({ upcoming, formatTime }: Props) {
  return (
    <>
      <section className="surface-card card-interactive overflow-hidden p-0">
        <div className="border-b border-secondary/10 bg-primary/5 px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary/90">
            התפילה הבאה
          </p>
        </div>
        <div className="p-6 sm:p-8">
          {upcoming ? (
            <div className="flex flex-col gap-5">
              <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                {upcoming.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 font-semibold text-accent">
                  <ClockIcon className="h-4 w-4" />
                  {formatTime(upcoming.start)}
                </span>
                <span className="flex items-center gap-2 text-primary/90">
                  <LocationIcon className="h-4 w-4 text-primary/70" />
                  {upcoming.location.name}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-primary/80">
                קיבולת מקסימלית {upcoming.location.maxCapacity.toLocaleString("he-IL")} מקומות
              </p>
            </div>
          ) : (
            <p className="text-base font-medium text-foreground/90">
              אין אירועים מתוכננים ב־24 השעות הקרובות.
            </p>
          )}
        </div>
      </section>

      <section className="mt-auto flex flex-col items-center gap-6 border-t border-secondary/15 pt-10">
        <p className="text-center text-sm leading-relaxed text-primary/85">
          להתחברות או הרשמה חדשה השתמשו בכפתורים למטה.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/auth/signin" className="btn-nav-secondary">
            התחברות
          </a>
          <a href="/auth/signup" className="btn-nav-primary">
            הרשמה
          </a>
        </div>
      </section>
    </>
  );
}
