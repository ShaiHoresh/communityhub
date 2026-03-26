import Link from "next/link";
import type { DailySchedule, PrayerEvent } from "@/lib/schedule";
import type { GmachItem } from "@/lib/gmach";
import type { DbAnnouncement } from "@/lib/db-announcements";
import type { DbDvarTorah } from "@/lib/db-dvar-torah";
import type { DbMazalTov } from "@/lib/db-mazal-tov";
import type { DbSpotlight } from "@/lib/db-spotlight";
import { getGmachCategoryById } from "@/lib/gmach";
import { MAZAL_TOV_EVENT_LABELS } from "@/lib/db-mazal-tov";
import { SignOutButton } from "@/components/SignOutButton";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";

const EVENT_EMOJIS: Record<DbMazalTov["eventType"], string> = {
  birth: "👶",
  bar_mitzvah: "📖",
  bat_mitzvah: "📖",
  wedding: "💍",
  anniversary: "💑",
  other: "🎊",
};

type Props = {
  schedule: DailySchedule;
  upcoming: PrayerEvent | undefined;
  formatTime: (d: Date) => string;
  gmachPreview: GmachItem[];
  isAdmin: boolean;
  highHolidaysEnabled: boolean;
  purimEnabled: boolean;
  announcements: DbAnnouncement[];
  dvarTorah: DbDvarTorah | null;
  mazalTovEntries: DbMazalTov[];
  spotlight: DbSpotlight | null;
};

export function HomeMember({
  schedule,
  upcoming,
  formatTime,
  gmachPreview,
  isAdmin,
  highHolidaysEnabled,
  purimEnabled,
  announcements,
  dvarTorah,
  mazalTovEntries,
  spotlight,
}: Props) {
  return (
    <>
      {/* ── Community announcements ── */}
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

      {/* ── Seasonal banner ── */}
      {(highHolidaysEnabled || purimEnabled) && (
        <section className="surface-card card-interactive flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/5 via-fuchsia-50 to-amber-50 px-5 py-4">
          <div className="space-y-1">
            <p className="font-heading text-sm font-semibold text-foreground">
              עונת חגים פעילה במערכת
            </p>
            <p className="text-xs text-primary/80">
              {highHolidaysEnabled && purimEnabled
                ? "רישום לימים נוראים ובחירת משלוחי מנות זמינים כעת."
                : highHolidaysEnabled
                  ? "רישום משפחתי למקומות בימים נוראים פתוח כעת."
                  : "בחירת חבילת משלוחי מנות לפורים פתוחה כעת."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {highHolidaysEnabled && (
              <Link href="/high-holidays" className="btn-secondary px-4 py-1.5 text-xs">
                רישום ימים נוראים
              </Link>
            )}
            {purimEnabled && (
              <Link href="/purim" className="btn-secondary px-4 py-1.5 text-xs">
                פורים – משלוחי מנות
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── Mazal Tov ── */}
      {mazalTovEntries.length > 0 && (
        <section className="surface-card overflow-hidden p-0">
          <div className="border-b border-amber-200/60 bg-gradient-to-l from-amber-50 to-yellow-50/60 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                  🎉 מזל טוב!
                </h2>
                <p className="mt-0.5 text-xs text-amber-800/75">
                  שמחות הקהילה ב-30 הימים האחרונים
                </p>
              </div>
            </div>
          </div>
          <ul className="divide-y divide-secondary/10 px-5 py-2">
            {mazalTovEntries.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <span className="text-2xl" aria-hidden="true">
                  {EVENT_EMOJIS[item.eventType]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-primary/65">
                    {MAZAL_TOV_EVENT_LABELS[item.eventType]}
                    {" · "}
                    {item.date.toLocaleDateString("he-IL")}
                  </p>
                  {item.message && (
                    <p className="mt-0.5 text-sm italic text-primary/75">{item.message}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 24h schedule ── */}
      <section className="surface-card overflow-hidden p-0">
        <div className="border-b border-secondary/10 bg-primary/5 px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-primary/90">
            24 שעות קדימה
          </p>
          {upcoming && (
            <p className="mt-1 text-sm font-medium text-foreground/90">
              האירוע הבא: {upcoming.title} · {formatTime(upcoming.start)}
            </p>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <p className="mb-5 text-xs leading-relaxed text-primary/70">
            תצוגה ניסיונית של מנוע הזמנים. הערכים ניתנים להתאמה לפי מנהג הקהילה.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedule.events.map((event) => (
              <div
                key={event.id}
                className="card-interactive surface-card flex flex-col gap-3 rounded-xl border border-secondary/20 p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-semibold text-foreground">
                    {event.title}
                  </h3>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {formatTime(event.start)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary/85">
                  <LocationIcon className="h-4 w-4 shrink-0 text-primary/60" />
                  <span>{event.location.name}</span>
                  <span className="text-primary/60">·</span>
                  <span>עד {event.location.maxCapacity.toLocaleString("he-IL")} מקומות</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── D'var Torah (collapsible) ── */}
      {dvarTorah && (
        <section className="surface-card overflow-hidden p-0">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-secondary/10 bg-secondary/5 px-6 py-4 transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 [&::-webkit-details-marker]:hidden">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                  דבר תורה שבועי
                </p>
                <h2 className="mt-0.5 font-heading text-lg font-bold text-foreground">
                  {dvarTorah.title}
                </h2>
                {(dvarTorah.parasha || dvarTorah.author) && (
                  <p className="text-xs text-primary/60">
                    {dvarTorah.parasha ? `פרשת ${dvarTorah.parasha}` : ""}
                    {dvarTorah.parasha && dvarTorah.author ? " · " : ""}
                    {dvarTorah.author}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 text-lg text-primary/50 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              >
                ▾
              </span>
            </summary>
            <div className="p-6 sm:p-8">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {dvarTorah.body}
              </p>
              <Link
                href="/dvar-torah"
                className="mt-5 inline-block text-sm font-semibold text-primary underline transition hover:text-primary/80"
              >
                לארכיון דברי התורה →
              </Link>
            </div>
          </details>
        </section>
      )}

      {/* ── Meet the Family Spotlight ── */}
      {spotlight && (
        <section className="surface-card overflow-hidden p-0">
          <div className="border-b border-secondary/10 bg-gradient-to-l from-primary/5 to-secondary/5 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
              משפחת החודש
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-6 p-6 sm:flex-nowrap sm:p-8">
            {spotlight.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={spotlight.photoUrl}
                alt={spotlight.householdName ?? "משפחת החודש"}
                className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow"
              />
            )}
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {spotlight.householdName}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-primary/85">{spotlight.bio}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Quick nav cards ── */}
      <section className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/directory"
          className="card-interactive surface-card block p-6 transition-all"
        >
          <h3 className="font-heading text-lg font-bold text-foreground">
            משפחות הקהילה
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-primary/80">
            מדריך קהילה עם סינון תגיות ופרטיות
          </p>
        </Link>
        <Link
          href="/gmach"
          className="card-interactive surface-card block p-6 transition-all"
        >
          <h3 className="font-heading text-lg font-bold text-foreground">
            לוח גמ״ח
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-primary/80">
            קטגוריות צבעוניות ועדיפות ועדה
          </p>
        </Link>
      </section>

      {/* ── Gmach preview ── */}
      <section className="surface-card overflow-hidden p-0">
        <div className="border-b border-secondary/10 bg-primary/5 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-bold text-foreground">
              לוח גמ״ח – עדכונים
            </h2>
            <Link
              href="/gmach"
              className="text-sm font-semibold text-primary underline transition hover:text-primary/80"
            >
              לכל הלוח →
            </Link>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          {gmachPreview.length === 0 ? (
            <p className="text-center text-primary/85">
              אין עדכונים כרגע.{" "}
              <Link
                href="/gmach"
                className="font-semibold text-primary underline hover:text-primary/80"
              >
                עבור ללוח המלא
              </Link>{" "}
              להוספת פריטים.
            </p>
          ) : (
            <ul className="space-y-4">
              {gmachPreview.map((item) => {
                const category = getGmachCategoryById(item.categoryId);
                return (
                  <li
                    key={item.id}
                    className="card-interactive surface-card flex flex-col gap-2 rounded-xl border border-secondary/20 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {item.isPinnedByCommittee && (
                        <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                          עדיפות ועדה
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          category?.color ?? "bg-secondary/20 text-primary border-secondary/40"
                        }`}
                      >
                        {category?.label ?? item.categoryId}
                      </span>
                    </div>
                    <p className="font-heading font-semibold text-foreground">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-primary/85 line-clamp-2">{item.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── Footer actions ── */}
      <section className="mt-auto flex flex-wrap items-center justify-between gap-6 border-t border-secondary/15 pt-10">
        <div className="space-y-1">
          <p className="font-heading font-semibold text-foreground">כניסה למערכת</p>
          <p className="text-sm leading-relaxed text-primary/80">
            {isAdmin
              ? "בקשת גישה למשק בית, מסך מנהל, והתנתקות."
              : "בקשת גישה למשק בית והתנתקות."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/request-access" className="btn-primary">
            בקשת גישה למשק בית
          </a>
          {isAdmin && (
            <a href="/admin/access-requests" className="btn-secondary">
              מסך אישורי מנהל
            </a>
          )}
          <a href="/contact" className="btn-secondary">
            צור קשר
          </a>
          <SignOutButton />
        </div>
      </section>
    </>
  );
}
