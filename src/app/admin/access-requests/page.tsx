import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { getPendingAccessRequests } from "@/lib/access-requests";
import { getPendingUsers } from "@/lib/households";
import { ApproveRejectButtons } from "./approve-reject-buttons";
import { PendingUserRow } from "./PendingUserRow";

export const metadata = {
  title: "אישורי גישה | CommunityHub",
  description: "מסך אישור בקשות גישה למערכת",
};

export default async function AdminAccessRequestsPage() {
  const pending = getPendingAccessRequests();
  const pendingUsers = getPendingUsers();

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="מסך אישורי מנהל – בקשות גישה"
        subtitle="אישור משתמשים שנרשמו (תור ממתינים) ובקשות הצטרפות למשק בית."
      />
      <main className="mx-auto max-w-3xl px-6 py-10 text-right">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← חזרה לדף הבית
          </Link>
        </div>

        {pendingUsers.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              משתמשים ממתינים (נרשמו ומועברים לאישור)
            </h2>
            <ul className="space-y-3">
              {pendingUsers.map((u) => (
                <PendingUserRow
                  key={u.id}
                  userId={u.id}
                  fullName={u.fullName}
                  email={u.email}
                />
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            בקשות גישה למשק בית (טופס בקשת גישה)
          </h2>
        {pending.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="text-foreground">אין בקשות ממתינות לאישור.</p>
            <Link
              href="/request-access"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              מעבר לטופס בקשת גישה
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {pending.map((req) => (
              <li key={req.id} className="surface-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium text-foreground">
                      {req.requesterName}
                      {req.secondAdultName ? ` + ${req.secondAdultName}` : ""}
                    </p>
                    <p className="text-sm text-primary/80">
                      {req.type === "new_household"
                        ? `משק בית חדש: ${req.householdNameOrId}`
                        : `הצטרפות למשק: ${req.householdNameOrId}`}
                    </p>
                    <p className="text-xs text-primary/70">
                      {req.requesterEmail}
                      {req.requesterPhone ? ` · ${req.requesterPhone}` : ""}
                    </p>
                    {req.notes && (
                      <p className="text-xs text-primary/70 border-t border-secondary/20 pt-2 mt-2">
                        {req.notes}
                      </p>
                    )}
                  </div>
                  <ApproveRejectButtons requestId={req.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
        </section>
      </main>
    </div>
  );
}
