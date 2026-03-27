import React from "react";
import { dbGetHhPrayers } from "@/lib/db-hh-prayers";
import { getHighHolidayRegistrations } from "@/lib/high-holidays";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { HhPrayerForm } from "./HhPrayerForm";
import { HhPrayerRow } from "./HhPrayerRow";

export const metadata = {
  title: "ימים נוראים – ניהול | ����� �����",
  description: "ניהול תפילות ורישומי מקומות לימים נוראים",
};

export const dynamic = "force-dynamic";

export default async function AdminHighHolidaysPage() {
  const prayers = await dbGetHhPrayers();
  const registrations = await getHighHolidayRegistrations();

  const prayerById = Object.fromEntries(prayers.map((p) => [p.id, p.name]));

  const excelRows = registrations.map((reg) => {
    const row: Record<string, string | number> = {
      משפחה: reg.householdName,
      ועדות: reg.committeeInterest,
      "משמרת הכנה": reg.prepSlot ?? "—",
    };
    for (const p of prayers) {
      const seat = reg.seats.find((s) => s.prayerId === p.id);
      row[`${p.name} – גברים`] = seat?.menSeats ?? 0;
      row[`${p.name} – נשים`] = seat?.womenSeats ?? 0;
    }
    const total = reg.seats.reduce((s, a) => s + a.menSeats + a.womenSeats, 0);
    row["סה״כ מקומות"] = total;
    return row;
  });

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        ימים נוראים – ניהול
      </h1>

      {/* Prayer list management */}
      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
          תפילות (הגדרת שורות טבלת המקומות)
        </h2>
        <p className="mb-4 text-xs text-primary/70">
          הוסיפו/ערכו את רשימת התפילות שיופיעו בטופס הרישום. כל תפילה תהווה שורה בטבלה שבה המשפחה מזינה מקומות לעזרת גברים ולעזרת נשים.
        </p>
        {prayers.length === 0 ? (
          <p className="text-sm text-primary/60">אין תפילות מוגדרות עדיין.</p>
        ) : (
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-secondary/20 bg-secondary/10">
                <th className="p-2 font-semibold text-foreground">תפילה</th>
                <th className="p-2 font-semibold text-foreground">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {prayers.map((p) => (
                <HhPrayerRow key={p.id} prayer={p} />
              ))}
            </tbody>
          </table>
        )}
        <HhPrayerForm />
      </section>

      {/* Registrations report */}
      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            רישומי מקומות ({registrations.length})
          </h2>
          {registrations.length > 0 && (
            <ExportExcelButton
              filename={`admin-high-holidays-${new Date().toISOString().slice(0, 10)}.xlsx`}
              sheetName="HighHolidays"
              rows={excelRows}
              className="btn-secondary text-sm"
            />
          )}
        </div>
        {registrations.length === 0 ? (
          <p className="text-sm text-primary/60">אין רישומים עדיין.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right text-sm">
              <thead>
                <tr className="border-b border-secondary/20 bg-secondary/10">
                  <th className="p-2 font-semibold text-foreground">משפחה</th>
                  {prayers.map((p) => (
                    <th key={p.id} className="p-2 text-center font-semibold text-foreground" colSpan={2}>
                      {p.name}
                    </th>
                  ))}
                  <th className="p-2 font-semibold text-foreground">סה״כ</th>
                  <th className="p-2 font-semibold text-foreground">ועדות</th>
                  <th className="p-2 font-semibold text-foreground">הכנה</th>
                </tr>
                <tr className="border-b border-secondary/10 text-xs text-primary/60">
                  <th />
                  {prayers.map((p) => (
                    <React.Fragment key={p.id}>
                      <th className="p-1 text-center">ג</th>
                      <th className="p-1 text-center">נ</th>
                    </React.Fragment>
                  ))}
                  <th />
                  <th />
                  <th />
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => {
                  const total = reg.seats.reduce((s, a) => s + a.menSeats + a.womenSeats, 0);
                  return (
                    <tr key={reg.id} className="border-b border-secondary/10">
                      <td className="p-2 font-medium text-foreground">{reg.householdName}</td>
                      {prayers.map((p) => {
                        const seat = reg.seats.find((s) => s.prayerId === p.id);
                        return (
                          <React.Fragment key={p.id}>
                            <td className="p-2 text-center text-primary/80">{seat?.menSeats ?? 0}</td>
                            <td className="p-2 text-center text-primary/80">{seat?.womenSeats ?? 0}</td>
                          </React.Fragment>
                        );
                      })}
                      <td className="p-2 font-semibold text-foreground">{total}</td>
                      <td className="p-2 text-xs text-primary/70">{reg.committeeInterest || "—"}</td>
                      <td className="p-2 text-xs text-primary/70">{reg.prepSlot ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
