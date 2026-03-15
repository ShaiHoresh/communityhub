import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { getPendingAccessRequests } from "@/lib/access-requests";
import { ApproveRejectButtons } from "./approve-reject-buttons";

export const metadata = {
  title: "אישורי גישה | CommunityHub",
  description: "מסך אישור בקשות גישה למערכת",
};

export default async function AdminAccessRequestsPage() {
  const pending = getPendingAccessRequests();

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="מסך אישורי מנהל – בקשות גישה"
        subtitle="אישור או דחיית בקשות להצטרפות למשק בית או לפתיחת משק בית חדש."
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
      </main>
    </div>
  );
}
