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
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-primary/90 transition hover:text-primary hover:underline"
        >
          ← חזרה לדף הבית
        </Link>

        <section className="surface-card card-interactive mb-10 p-6 sm:p-8">
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
            רישום אירוע חדש
          </h2>
          <LifeEventForm />
        </section>

        <section>
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
            אירועים קרובים (60 הימים הבאים)
          </h2>
          {upcoming.length === 0 ? (
            <div className="surface-card card-interactive p-10 text-center">
              <p className="font-medium text-foreground">
                אין אירועים קרובים או שעדיין לא נרשמו אירועים.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {upcoming.map((ev) => (
                <li key={ev.id} className="surface-card card-interactive p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-heading font-semibold text-foreground">{ev.label}</p>
                      <p className="mt-0.5 text-sm text-primary/85">
                        {ev.type === "birth" ? "יום הולדת" : "אזכרה"} · {formatDate(ev.nextDate)}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
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
