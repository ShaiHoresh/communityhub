import { getPurimRecipientReport, getPurimSelections } from "@/lib/purim";
import { dbGetHouseholds } from "@/lib/db-households";
import { ExportExcelButton } from "@/components/ExportExcelButton";

export const metadata = {
  title: "דוח פורים | CommunityHub",
  description: "דוח מקבלי משלוחי מנות לפי בחירות משפחות",
};

export const dynamic = "force-dynamic";

export default async function AdminPurimReportPage() {
  const households = await dbGetHouseholds();
  const report = await getPurimRecipientReport();
  const selections = await getPurimSelections();
  const fullCommunityGivers = selections.filter((s) => s.tier === "full");

  const byId = Object.fromEntries(households.map((h) => [h.id, h.name]));

  const rows = households
    .map((h) => ({
      householdId: h.id,
      householdName: h.name,
      givers: report[h.id] ?? [],
    }))
    .sort((a, b) => b.givers.length - a.givers.length);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          דוח פורים – מקבלי משלוחי מנות
        </h1>
        <ExportExcelButton
          filename={`admin-purim-report-${new Date().toISOString().slice(0, 10)}.xlsx`}
          sheetName="PurimReport"
          rows={rows.map((r) => ({
            "מזהה משפחה": r.householdId,
            משפחה: r.householdName,
            "כמות שולחים": r.givers.length,
            שולחים: r.givers
              .map((sel) => (sel.householdId ? (byId[sel.householdId] ?? sel.householdId) : sel.userId))
              .join(", "),
          }))}
          className="btn-secondary text-sm"
        />
      </div>

      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <p className="text-sm text-primary/80">
          הדוח מציג לכל משפחה את מי שבחרו לשלוח אליה משלוח מנות (בחבילות 5/20).
          חבילת &quot;כל הקהילה&quot; אינה מייצרת בחירות ספציפיות ולכן אינה נספרת כאן.
        </p>
        <p className="mt-2 text-xs text-primary/60">
          נתון פיתוח: נשמרו {selections.length} בחירות פורים.
        </p>
      </section>

      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <h2 className="mb-2 font-heading text-lg font-bold text-foreground">
          בוחרים בחבילת &quot;כל הקהילה&quot;
        </h2>
        <p className="text-sm text-primary/80">
          אלו שולחים שבחרו לשלוח לכל הקהילה (ללא בחירת נמענים ספציפיים).
        </p>
        <p className="mt-2 text-sm text-primary/80">
          סה&quot;כ: <span className="font-semibold">{fullCommunityGivers.length}</span>
        </p>
        {fullCommunityGivers.length === 0 ? (
          <p className="mt-3 text-sm text-primary/60">—</p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {fullCommunityGivers.map((sel, idx) => (
              <li
                key={`${sel.userId}_${idx}`}
                className="rounded-xl border border-secondary/20 bg-secondary/5 px-3 py-2 text-sm text-primary/90"
              >
                {sel.householdId
                  ? (byId[sel.householdId] ?? sel.householdId)
                  : sel.userId}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface-card card-interactive overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[620px] text-right text-sm">
          <thead>
            <tr className="border-b border-secondary/20 bg-secondary/10">
              <th className="p-3 font-semibold text-foreground">משפחה</th>
              <th className="p-3 font-semibold text-foreground">כמות שולחים</th>
              <th className="p-3 font-semibold text-foreground">שולחים (משפחות)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.householdId} className="border-b border-secondary/10 align-top">
                <td className="p-3 font-medium text-foreground">{row.householdName}</td>
                <td className="p-3 text-primary/80">{row.givers.length}</td>
                <td className="p-3">
                  {row.givers.length === 0 ? (
                    <span className="text-primary/60">—</span>
                  ) : (
                    <ul className="space-y-1">
                      {row.givers.map((sel, idx) => (
                        <li key={`${sel.userId}_${idx}`} className="text-primary/85">
                          {sel.householdId ? (byId[sel.householdId] ?? sel.householdId) : sel.userId}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

