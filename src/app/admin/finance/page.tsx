import { getProjects } from "@/lib/projects";
import {
  getTransactionsByProject,
  getBalanceForProject,
  getAllTransactions,
} from "@/lib/transactions";
import { CreateProjectForm } from "./CreateProjectForm";
import { TransactionForm } from "./TransactionForm";
import { GeneralLedger } from "./GeneralLedger";
import { PaymentGatewayPlaceholder } from "./PaymentGatewayPlaceholder";
import { ExportExcelButton } from "@/components/ExportExcelButton";

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("he-IL");
}

export const metadata = {
  title: "כספים | ����� �����",
  description: "ניהול פרויקטים, הכנסות והוצאות",
};

export default async function AdminFinancePage() {
  const projects = await getProjects();
  const allTransactions = await getAllTransactions();
  const perProject = await Promise.all(
    projects.map(async (project) => {
      const [balance, txs] = await Promise.all([
        getBalanceForProject(project.id),
        getTransactionsByProject(project.id),
      ]);
      return { project, balance, txs };
    }),
  );

  const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          מרכז כספים – פרויקטים והכנסות/הוצאות
        </h1>
        <ExportExcelButton
          filename={`admin-ledger-${new Date().toISOString().slice(0, 10)}.xlsx`}
          sheetName="Ledger"
          rows={allTransactions.map((t) => ({
            תאריך: formatDate(t.date),
            פרויקט: projectNames[t.projectId] ?? t.projectId,
            סוג: t.type === "income" ? "הכנסה" : "הוצאה",
            תיאור: t.description || "—",
            סכום: `${t.type === "income" ? "+" : "−"}₪${formatCents(t.amountCents)}`,
            מזהה: t.id,
          }))}
          className="btn-secondary text-sm"
        />
      </div>

      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
            פרויקט חדש
          </h2>
          <CreateProjectForm />
        </section>

        <section>
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
            פרויקטים ומאזן
          </h2>
          {projects.length === 0 ? (
            <div className="surface-card card-interactive p-10 text-center text-primary/85">
              אין פרויקטים. הוסף פרויקט למעלה.
            </div>
          ) : (
            <ul className="space-y-6">
              {perProject.map(({ project, balance, txs }) => {
                return (
                  <li key={project.id} className="surface-card card-interactive overflow-hidden rounded-2xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-semibold text-foreground">
                          {project.name}
                        </h3>
                        <p className="mt-1 text-sm text-primary/80">
                          מאזן: ₪{formatCents(balance)} · {txs.length} רשומות
                        </p>
                      </div>
                      <TransactionForm projectId={project.id} />
                    </div>
                    {txs.length > 0 && (
                      <div className="mt-4 border-t border-secondary/20 pt-4">
                        <p className="mb-2 text-xs font-semibold text-primary/80">
                          רשומות אחרונות
                        </p>
                        <ul className="space-y-1 text-sm">
                          {txs.slice(0, 5).map((t) => (
                            <li
                              key={t.id}
                              className="flex flex-wrap justify-between gap-2"
                            >
                              <span>
                                {formatDate(t.date)} · {t.description || "—"}
                              </span>
                              <span
                                className={
                                  t.type === "income"
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-red-700 dark:text-red-400"
                                }
                              >
                                {t.type === "income" ? "+" : "−"}₪
                                {formatCents(t.amountCents)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
            גלופה כללית
          </h2>
          <GeneralLedger
            transactions={allTransactions}
            projects={projects}
            formatCents={formatCents}
            formatDate={formatDate}
          />
        </section>

      <section>
        <PaymentGatewayPlaceholder projects={projects} />
      </section>
    </div>
  );
}
