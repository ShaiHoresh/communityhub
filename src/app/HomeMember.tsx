import Link from "next/link";
import type { DailySchedule, PrayerEvent } from "@/lib/schedule";
import type { GmachItem } from "@/lib/gmach";
import { getGmachCategoryById } from "@/lib/gmach";
import type { DbDvarTorah } from "@/lib/db-dvar-torah";
import { DvarTorahCard } from "@/components/DvarTorahCard";
import { SignOutButton } from "@/components/SignOutButton";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { LocationIcon } from "@/components/icons/LocationIcon";

type Props = {
  schedule: DailySchedule;
  upcoming: PrayerEvent | undefined;
  formatTime: (d: Date) => string;
  /** Gmach items to show on homepage (members only, max 5). */
  gmachPreview: GmachItem[];
  /** True if current user is ADMIN (sees admin links). */
  isAdmin: boolean;
  /** Seasonal modules toggles for contextual UI. */
  highHolidaysEnabled: boolean;
  purimEnabled: boolean;
  /** Weekly d'var torah — shown in full for members. */
  dvarTorah: DbDvarTorah | null;
};

export function HomeMember({
  schedule,
  upcoming,
  formatTime,
  gmachPreview,
  isAdmin,
  highHolidaysEnabled,
  purimEnabled,
  dvarTorah,
}: Props) {
  return (
    <>
      {(highHolidaysEnabled || purimEnabled) && (
        <section className="surface-card card-interactive flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/5 via-fuchsia-50 to-amber-50 px-5 py-4">
          <div className="space-y-1">
            <p className="text-sm font-heading font-semibold text-foreground">
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

      {dvarTorah && <DvarTorahCard dvarTorah={dvarTorah} />}

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
            לוח מודעות
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-primary/80">
            קטגוריות צבעוניות ועדיפות ועדה
          </p>
        </Link>
      </section>

      <section className="surface-card overflow-hidden p-0">
        <div className="border-b border-secondary/10 bg-primary/5 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-bold text-foreground">
              לוח מודעות– עדכונים
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
              אין עדכונים כרגע. עיין ב{" "}
              <Link href="/gmach" className="font-semibold text-primary underline hover:text-primary/80">
                לוח המלא
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
                    <p className="font-heading font-semibold text-foreground">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-primary/85 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-auto flex flex-wrap items-center justify-between gap-6 border-t border-secondary/15 pt-10">
        <div className="space-y-1">
          <p className="font-heading font-semibold text-foreground">
            כניסה למערכת
          </p>
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
          <SignOutButton />
        </div>
      </section>
    </>
  );
}
