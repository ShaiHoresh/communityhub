import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { getUpcomingLifeEvents } from "@/lib/life-events";
import { LifeEventForm } from "./LifeEventForm";

function formatDate(d: Date) {
  return d.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const metadata = {
  title: "אירועי חיים | CommunityHub",
  description: "רישום ימי הולדת ואזכרות, תצוגת אירועים קרובים",
};

export default async function LifeEventsPage() {
  const upcoming = getUpcomingLifeEvents(60);

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="אירועי חיים"
        subtitle="רישום ימי הולדת ואזכרות (יארצייט). התצוגה מציגה אירועים קרובים ל־60 הימים הבאים."
      />
      <main className="mx-auto max-w-3xl px-6 py-10 text-right">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← חזרה לדף הבית
          </Link>
        </div>

        <section className="surface-card mb-8 p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            רישום אירוע חדש
          </h2>
          <LifeEventForm />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            אירועים קרובים (60 הימים הבאים)
          </h2>
          {upcoming.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-foreground">
                אין אירועים קרובים או שעדיין לא נרשמו אירועים.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((ev) => (
                <li key={ev.id} className="surface-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{ev.label}</p>
                      <p className="text-sm text-primary/80">
                        {ev.type === "birth" ? "יום הולדת" : "אזכרה"} ·{" "}
                        {formatDate(ev.nextDate)}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                      {formatDate(ev.nextDate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
