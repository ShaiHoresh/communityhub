import Link from "next/link";
import { getUsers } from "@/lib/households";
import { getPendingUsers } from "@/lib/households";
import { getPendingAccessRequests } from "@/lib/access-requests";
import { getProjects } from "@/lib/projects";
import { getTotalBalanceCents } from "@/lib/transactions";
import { getAllToggles, getModuleLabel } from "@/lib/system-toggles";

export const metadata = {
  title: "סקירת מנהל | CommunityHub",
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
  const users = getUsers();
  const membersCount = users.filter(
    (u) => u.status === "MEMBER" || u.status === "ADMIN"
  ).length;
  const pendingUsers = getPendingUsers();
  const pendingRequests = getPendingAccessRequests();
  const projects = getProjects();
  const totalBalanceCents = getTotalBalanceCents(projects.map((p) => p.id));
  const toggles = getAllToggles();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">סקירה</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/access-requests"
          className="surface-card flex flex-col rounded-xl p-5 transition hover:ring-2 hover:ring-primary/30"
        >
          <span className="text-sm font-medium text-primary/80">
            משתמשים ממתינים
          </span>
          <span className="mt-1 text-2xl font-bold text-foreground">
            {pendingUsers.length}
          </span>
        </Link>
        <div className="surface-card flex flex-col rounded-xl p-5">
          <span className="text-sm font-medium text-primary/80">
            בקשות גישה (טופס)
          </span>
          <span className="mt-1 text-2xl font-bold text-foreground">
            {pendingRequests.length}
          </span>
        </div>
        <div className="surface-card flex flex-col rounded-xl p-5">
          <span className="text-sm font-medium text-primary/80">
            חברים פעילים
          </span>
          <span className="mt-1 text-2xl font-bold text-foreground">
            {membersCount}
          </span>
        </div>
        <Link
          href="/admin/finance"
          className="surface-card flex flex-col rounded-xl p-5 transition hover:ring-2 hover:ring-primary/30"
        >
          <span className="text-sm font-medium text-primary/80">
            יתרה כללית (פרויקטים)
          </span>
          <span className="mt-1 text-2xl font-bold text-foreground">
            ₪{formatCents(totalBalanceCents)}
          </span>
        </Link>
      </section>

      <section className="surface-card rounded-xl p-5">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          מודולים עונתיים
        </h2>
        <ul className="space-y-2">
          {(Object.entries(toggles) as [keyof typeof toggles, boolean][]).map(
            ([key, enabled]) => (
              <li key={key} className="flex items-center gap-3">
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    enabled ? "bg-green-500" : "bg-secondary/30"
                  }`}
                  aria-hidden
                />
                <span className="text-foreground">
                  {getModuleLabel(key)}: {enabled ? "פעיל" : "כבוי"}
                </span>
              </li>
            )
          )}
        </ul>
        <Link
          href="/admin/settings"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          שינוי בהגדרות מערכת →
        </Link>
      </section>
    </div>
  );
}
