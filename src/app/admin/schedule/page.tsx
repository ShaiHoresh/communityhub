import { getLocations } from "@/lib/locations";
import { getScheduleEntries } from "@/lib/schedule-entries";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { ScheduleEntryForm } from "./ScheduleEntryForm";
import { ScheduleEntryRow } from "./ScheduleEntryRow";
import { SeedScheduleButton } from "./SeedScheduleButton";

export const metadata = {
  title: "מנהל לוח זמנים | CommunityHub",
  description: "ניהול תפילות ושיעורים",
};

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const locations = await getLocations();
  const entries = await getScheduleEntries();
  const locationNames = Object.fromEntries(locations.map((l) => [l.id, l.name]));
  const typeLabels: Record<string, string> = {
    shacharit: "שחרית",
    mincha: "מנחה",
    arvit: "ערבית",
    lesson: "שיעור",
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          מנהל לוח זמנים
        </h1>
        <ExportExcelButton
          filename={`admin-schedule-${new Date().toISOString().slice(0, 10)}.xlsx`}
          sheetName="Schedule"
          rows={entries.map((e) => ({
            מזהה: e.id,
            סוג: typeLabels[e.type] ?? e.type,
            כותרת: e.title,
            שעה: `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}`,
            מיקום: locationNames[e.locationId] ?? e.locationId,
            "התאמה עונתית": e.useSeasonalMinchaOffset ? "כן" : "לא",
            "סדר מיון": e.sortOrder,
          }))}
          className="btn-secondary text-sm"
        />
      </div>

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
