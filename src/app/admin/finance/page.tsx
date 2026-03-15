import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
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
  title: "כספים | CommunityHub",
  description: "ניהול פרויקטים, הכנסות והוצאות",
};

export default async function AdminFinancePage() {
  const projects = getProjects();
  const allTransactions = getAllTransactions();

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="מרכז כספים – פרויקטים והכנסות/הוצאות"
        subtitle="יצירת פרויקטים, רישום הכנסות והוצאות, ותצוגת גלופה."
      />
      <main className="mx-auto max-w-4xl px-6 py-10 text-right">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← חזרה לדף הבית
          </Link>
          <Link
            href="/admin/access-requests"
            className="text-sm font-medium text-primary hover:underline"
          >
            אישורי גישה
          </Link>
        </div>

        <section className="surface-card mb-8 p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            פרויקט חדש
          </h2>
          <CreateProjectForm />
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            פרויקטים ומאזן
          </h2>
          {projects.length === 0 ? (
            <div className="surface-card p-8 text-center text-primary/80">
              אין פרויקטים. הוסף פרויקט למעלה.
            </div>
          ) : (
            <ul className="space-y-6">
              {projects.map((project) => {
                const balance = getBalanceForProject(project.id);
                const txs = getTransactionsByProject(project.id);
                return (
                  <li key={project.id} className="surface-card overflow-hidden p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">
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

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
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
      </main>
    </div>
  );
}
