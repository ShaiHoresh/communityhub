import type { Project } from "@/lib/projects";
import type { Transaction } from "@/lib/transactions";

type Props = {
  transactions: Transaction[];
  projects: Project[];
  formatCents: (c: number) => string;
  formatDate: (d: Date) => string;
};

export function GeneralLedger({
  transactions,
  projects,
  formatCents,
  formatDate,
}: Props) {
  const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  if (transactions.length === 0) {
    return (
      <div className="surface-card card-interactive rounded-2xl p-10 text-center text-primary/85">
        אין עדיין רשומות בגלופה.
      </div>
    );
  }

  return (
    <div className="surface-card card-interactive overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[400px] text-right text-sm">
        <thead>
          <tr className="border-b border-secondary/20 bg-secondary/10">
            <th className="p-3 font-semibold text-foreground">תאריך</th>
            <th className="p-3 font-semibold text-foreground">פרויקט</th>
            <th className="p-3 font-semibold text-foreground">סוג</th>
            <th className="p-3 font-semibold text-foreground">תיאור</th>
            <th className="p-3 font-semibold text-foreground">סכום</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-secondary/10">
              <td className="p-3 text-primary/80">{formatDate(t.date)}</td>
              <td className="p-3 text-foreground">
                {projectNames[t.projectId] ?? t.projectId}
              </td>
              <td className="p-3">
                <span
                  className={
                    t.type === "income"
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }
                >
                  {t.type === "income" ? "הכנסה" : "הוצאה"}
                </span>
              </td>
              <td className="p-3 text-primary/80">{t.description || "—"}</td>
              <td className="p-3 font-medium">
                <span
                  className={
                    t.type === "income"
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400"
                  }
                >
                  {t.type === "income" ? "+" : "−"}₪{formatCents(t.amountCents)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
