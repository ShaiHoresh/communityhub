import { getLocations } from "@/lib/locations";
import { getScheduleEntries } from "@/lib/schedule-entries";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { ScheduleEntryForm } from "./ScheduleEntryForm";
import { ScheduleEntryRow } from "./ScheduleEntryRow";
import { SeedScheduleButton } from "./SeedScheduleButton";
import {
  DAY_TYPE_LABELS,
  SEASON_LABELS,
  TIME_TYPE_LABELS,
  ZMAN_LABELS,
  type DayType,
  type Season,
  type TimeType,
  type ZmanKey,
} from "@/lib/zmanim";

export const metadata = {
  title: "מנהל לוח זמנים | קהילת באורך",
  description: "ניהול תפילות ושיעורים",
};

export const dynamic = "force-dynamic";

function timeDisplayForExport(entry: {
  timeType: string;
  fixedHour: number | null;
  fixedMinute: number | null;
  zmanKey: string | null;
  offsetMinutes: number;
}): string {
  if (entry.timeType === "FIXED") {
    return `${String(entry.fixedHour ?? 0).padStart(2, "0")}:${String(entry.fixedMinute ?? 0).padStart(2, "0")}`;
  }
  const zman = entry.zmanKey ? ZMAN_LABELS[entry.zmanKey as ZmanKey] ?? entry.zmanKey : "?";
  if (entry.timeType === "ZMANIM_BASED") return zman;
  const sign = entry.offsetMinutes >= 0 ? "+" : "";
  return `${zman} ${sign}${entry.offsetMinutes} דק׳`;
}

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
            ימים: e.dayTypes.map((d: DayType) => DAY_TYPE_LABELS[d]).join(", "),
            עונה: SEASON_LABELS[e.season as Season],
            "חישוב שעה": TIME_TYPE_LABELS[e.timeType as TimeType],
            שעה: timeDisplayForExport(e),
            עיגול: e.roundTo > 0 ? `${e.roundTo} דק׳` : "ללא",
            מיקום: locationNames[e.locationId] ?? e.locationId,
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
              אין רשומות. ברירת המחדל (שחרית, מנחה, ערבית) תיטען בלחיצה למטה.
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

      <div className="surface-card rounded-2xl border border-secondary/15 p-5 text-sm leading-relaxed text-primary/80">
        <p className="font-heading font-semibold text-foreground mb-2">מדריך סוגי שעות:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>שעה קבועה</strong> — זמן סטטי (למשל 07:00).</li>
          <li><strong>לפי זמן הלכתי</strong> — מחושב מהנץ/שקיעה/חצות וכו&apos; (דרך Hebcal).</li>
          <li><strong>זמן הלכתי + הזזה</strong> — זמן הלכתי ± דקות (למשל &quot;20 דקות לפני השקיעה&quot;).</li>
          <li><strong>עיגול</strong> — מעגל את התוצאה לכפולה של N דקות (למשל 5 דקות, כך ש-18:13 הופך ל-18:15).</li>
        </ul>
      </div>
    </div>
  );
}
