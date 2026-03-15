import { BrandHeader } from "@/components/BrandHeader";
import { getLocations } from "@/lib/locations";
import { buildDailyScheduleForDate } from "@/lib/schedule";

function formatTime(d: Date) {
  return d.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type HomeProps = { searchParams: Promise<{ request?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const locations = getLocations();
  const mainLocation = locations[0];
  const today = new Date();
  const params = await searchParams;
  const showRequestSubmitted = params.request === "submitted";

  const schedule = await buildDailyScheduleForDate(today, mainLocation);
  const upcoming = schedule.events
    .filter((e) => e.start.getTime() >= Date.now())
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="קהילת בית הכנסת / מרכז קהילתי"
        subtitle="לוח תפילות ושיעורים בזמן אמת, חיבור בין משפחות הקהילה, וריכוז תהליכים קהילתיים (חגים, תרומות ומיזמים) במקום אחד."
      />
      <main className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-4xl flex-col gap-10 px-6 py-12 text-right sm:px-12">
        {showRequestSubmitted && (
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            הבקשה נשלחה בהצלחה. הנהלת הקהילה תטפל בה בהקדם.
          </div>
        )}

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
          <a
            href="/directory"
            className="surface-card block p-5 transition hover:border-primary/40"
          >
            <h3 className="font-semibold text-foreground">משפחות הקהילה</h3>
            <p className="mt-1 text-sm text-primary/80">
              מדריך קהילה עם סינון תגיות ופרטיות
            </p>
          </a>
          <a
            href="/gmach"
            className="surface-card block p-5 transition hover:border-primary/40"
          >
            <h3 className="font-semibold text-foreground">לוח גמ״ח</h3>
            <p className="mt-1 text-sm text-primary/80">
              קטגוריות צבעוניות ועדיפות ועדה
            </p>
          </a>
          <a
            href="/life-events"
            className="surface-card block p-5 transition hover:border-primary/40"
          >
            <h3 className="font-semibold text-foreground">אירועי חיים</h3>
            <p className="mt-1 text-sm text-primary/80">
              ימי הולדת ואזכרות, אירועים קרובים
            </p>
          </a>
        </section>

        <section className="mt-auto flex flex-wrap items-center justify-between gap-6 border-t border-secondary/20 pt-8">
          <div className="space-y-1">
            <p className="font-medium text-foreground">כניסה למערכת</p>
            <p className="text-sm text-primary/80">
              בגרסה זו טרם חובר שירות הזדהות, אך הזרימה של בקשת הגישה והאישור
              האדמיניסטרטיבי כבר ממומשת.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/request-access" className="btn-primary">
              בקשת גישה למשק בית
            </a>
            <a href="/admin/access-requests" className="btn-secondary">
              מסך אישורי מנהל
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
