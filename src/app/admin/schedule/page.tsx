import { getLocations } from "@/lib/locations";
import { getScheduleEntries } from "@/lib/schedule-entries";
import { ScheduleEntryForm } from "./ScheduleEntryForm";
import { ScheduleEntryRow } from "./ScheduleEntryRow";
import { SeedScheduleButton } from "./SeedScheduleButton";

export const metadata = {
  title: "מנהל לוח זמנים | CommunityHub",
  description: "ניהול תפילות ושיעורים",
};

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const locations = getLocations();
  const entries = await getScheduleEntries();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        מנהל לוח זמנים
      </h1>

      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          הוספת תפילה / שיעור
        </h2>
        <ScheduleEntryForm locations={locations} />
      </section>

      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          רשומות לוח (לפי סדר)
        </h2>
        {entries.length === 0 ? (
          <div className="surface-card card-interactive rounded-2xl p-10 text-center">
            <p className="font-medium text-foreground">
              אין רשומות. ברירת המחדל (שחרית, מנחה, ערבית) תיטען בדף הבית או בלחיצה למטה.
            </p>
            <SeedScheduleButton className="mt-4" />
          </div>
        ) : (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <ScheduleEntryRow key={entry.id} entry={entry} locations={locations} />
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-primary/80">
        מנחה עם &quot;התאמה עונתית&quot; משתמשת בהזזת 15 דקות לפי עונה (חורף/קיץ).
      </p>
    </div>
  );
}
