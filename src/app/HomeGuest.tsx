import type { PrayerEvent } from "@/lib/schedule";
import type { DbAnnouncement } from "@/lib/db-announcements";
import type { DbDvarTorah } from "@/lib/db-dvar-torah";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";

type Props = {
  upcoming: PrayerEvent | undefined;
  formatTime: (d: Date) => string;
  announcements: DbAnnouncement[];
  dvarTorah: DbDvarTorah | null;
};

export function HomeGuest({ upcoming, formatTime, announcements, dvarTorah }: Props) {
  return (
    <>
      {/* Community announcements — visible to everyone */}
      {announcements.length > 0 && (
        <section className="space-y-3" aria-label="מודעות קהילה">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`rounded-2xl px-5 py-4 shadow-sm ${
                ann.isPinned
                  ? "border border-accent/20 bg-accent/10"
                  : "border border-secondary/20 bg-white"
              }`}
            >
              {ann.isPinned && (
                <p className="mb-1 text-xs font-bold text-accent">📌 הודעה חשובה</p>
              )}
              <p className="font-heading font-semibold text-foreground">{ann.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-primary/80">{ann.body}</p>
            </div>
          ))}
        </section>
      )}

      {/* Next prayer */}
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

      {/* D'var Torah teaser — public preview to entice sign-up */}
      {dvarTorah && (
        <section className="surface-card overflow-hidden p-0">
          <div className="border-b border-secondary/10 bg-secondary/5 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
              דבר תורה שבועי
            </p>
          </div>
          <div className="p-6">
            <p className="text-xs font-semibold text-secondary">
              {dvarTorah.parasha ? `פרשת ${dvarTorah.parasha}` : ""}
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold text-foreground">
              {dvarTorah.title}
            </h2>
            {dvarTorah.author && (
              <p className="mt-0.5 text-sm text-primary/70">{dvarTorah.author}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-primary/75 line-clamp-2">
              {dvarTorah.body}
            </p>
            <a
              href="/auth/signup"
              className="mt-4 inline-block text-sm font-semibold text-primary underline transition hover:text-primary/80"
            >
              הצטרפו לקהילה לקריאה מלאה →
            </a>
          </div>
        </section>
      )}

      {/* Sign in / register CTA */}
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
          <a href="/contact" className="btn-nav-secondary">
            צור קשר
          </a>
        </div>
      </section>
    </>
  );
}
