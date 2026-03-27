import Link from "next/link";
import { getPendingAccessRequests } from "@/lib/access-requests";
import { getProjects } from "@/lib/projects";
import { getTotalBalanceCents } from "@/lib/transactions";
import { getAllToggles, getModuleLabel } from "@/lib/system-toggles";
import { dbGetActiveMembersCount, dbGetPendingUsers } from "@/lib/db-users";

export const metadata = {
  title: "סקירת מנהל | קהילת באורך",
  description: "סטטיסטיקות וקישורים מהירים",
};

export const dynamic = "force-dynamic";

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminOverviewPage() {
  const pendingUsers = await dbGetPendingUsers();
  const pendingRequests = await getPendingAccessRequests();
  const membersCount = await dbGetActiveMembersCount();
  const projects = await getProjects();
  const totalBalanceCents = await getTotalBalanceCents(projects.map((p) => p.id));
  const toggles = await getAllToggles();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">סקירה</h1>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/access-requests"
          className="surface-card card-interactive flex flex-col rounded-2xl p-6"
        >
          <span className="text-sm font-semibold text-primary/85">
            משתמשים ממתינים
          </span>
          <span className="mt-2 font-heading text-2xl font-bold text-foreground">
            {pendingUsers.length}
          </span>
        </Link>
        <div className="surface-card card-interactive flex flex-col rounded-2xl p-6">
          <span className="text-sm font-semibold text-primary/85">
            בקשות גישה (טופס)
          </span>
          <span className="mt-2 font-heading text-2xl font-bold text-foreground">
            {pendingRequests.length}
          </span>
        </div>
        <div className="surface-card card-interactive flex flex-col rounded-2xl p-6">
          <span className="text-sm font-semibold text-primary/85">
            חברים פעילים
          </span>
          <span className="mt-2 font-heading text-2xl font-bold text-foreground">
            {membersCount}
          </span>
        </div>
        <Link
          href="/admin/finance"
          className="surface-card card-interactive flex flex-col rounded-2xl p-6"
        >
          <span className="text-sm font-semibold text-primary/85">
            יתרה כללית (פרויקטים)
          </span>
          <span className="mt-2 font-heading text-2xl font-bold text-foreground">
            ₪{formatCents(totalBalanceCents)}
          </span>
        </Link>
      </section>

      <section className="surface-card card-interactive rounded-2xl p-6">
        <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
          מודולים עונתיים
        </h2>
        <ul className="space-y-3">
          {(Object.entries(toggles) as [keyof typeof toggles, boolean][]).map(
            ([key, enabled]) => (
              <li key={key} className="flex items-center gap-3">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    enabled ? "bg-green-500" : "bg-secondary/30"
                  }`}
                  aria-hidden
                />
                <span className="font-medium text-foreground">
                  {getModuleLabel(key)}: {enabled ? "פעיל" : "כבוי"}
                </span>
              </li>
            )
          )}
        </ul>
        <Link
          href="/admin/settings"
          className="mt-5 inline-block text-sm font-semibold text-primary underline transition hover:text-primary/80"
        >
          שינוי בהגדרות מערכת →
        </Link>
      </section>
    </div>
  );
}
