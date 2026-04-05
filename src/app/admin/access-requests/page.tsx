import Link from "next/link";
import { getPendingAccessRequests } from "@/lib/access-requests";
import { dbGetPendingUsers } from "@/lib/db-users";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { ApproveRejectButtons } from "./approve-reject-buttons";
import { PendingUserRow } from "./PendingUserRow";

export const metadata = {
  title: "אישורי גישה | CommunityHub",
  description: "מסך אישור בקשות גישה למערכת",
};

/** Always use fresh in-memory data; avoid static snapshot with empty list. */
export const dynamic = "force-dynamic";

export default async function AdminAccessRequestsPage() {
  const pending = await getPendingAccessRequests();
  const pendingUsers = await dbGetPendingUsers();

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          אישורי גישה – תור משתמשים ובקשות למשק בית
        </h1>
        <div className="flex flex-wrap gap-2">
          <ExportExcelButton
            filename={`admin-pending-users-${new Date().toISOString().slice(0, 10)}.xlsx`}
            sheetName="PendingUsers"
            rows={pendingUsers.map((u) => ({
              מזהה: u.id,
              שם: u.fullName,
              אימייל: u.email ?? "",
            }))}
            className="btn-secondary text-sm"
          />
          <ExportExcelButton
            filename={`admin-access-requests-${new Date().toISOString().slice(0, 10)}.xlsx`}
            sheetName="AccessRequests"
            rows={pending.map((r) => ({
              מזהה: r.id,
              סוג: r.type,
              "משק בית": r.householdNameOrId,
              "שם מבקש": r.requesterName,
              "אימייל מבקש": r.requesterEmail,
              טלפון: r.requesterPhone ?? "",
              "אדם נוסף": r.secondAdultName ?? "",
              "אימייל נוסף": r.secondAdultEmail ?? "",
              "טלפון נוסף": r.secondAdultPhone ?? "",
              הערות: r.notes ?? "",
              נוצר: new Date(r.createdAt).toLocaleString("he-IL"),
            }))}
            className="btn-secondary text-sm"
          />
        </div>
      </div>

      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          משתמשים ממתינים (נרשמו ומועברים לאישור)
        </h2>
          {pendingUsers.length > 0 ? (
            <ul className="space-y-4">
              {pendingUsers.map((u) => (
                <PendingUserRow
                  key={u.id}
                  userId={u.id}
                  fullName={u.fullName}
                  email={u.email}
                />
              ))}
            </ul>
          ) : (
            <div className="surface-card card-interactive p-8 text-center">
              <p className="font-medium text-foreground">אין משתמשים ממתינים.</p>
              <p className="mt-2 text-sm leading-relaxed text-primary/80">
                אם הרצת Supabase, המשתמשים נשמרים בבסיס נתונים. אם אתה עדיין במצב זיכרון, להצגת משתמש בדיקה (pending@test.com) הרץ בדפדפן:{" "}
                <a href="/api/seed" className="font-mono text-primary underline" target="_blank" rel="noopener noreferrer">/api/seed</a>
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
            בקשות גישה למשק בית (טופס בקשת גישה)
          </h2>
        {pending.length === 0 ? (
          <div className="surface-card card-interactive p-10 text-center">
            <p className="font-medium text-foreground">אין בקשות ממתינות לאישור.</p>
            <Link
              href="/request-access"
              className="mt-4 inline-block text-sm font-semibold text-primary underline transition hover:text-primary/80"
            >
              מעבר לטופס בקשת גישה
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {pending.map((req) => (
              <li key={req.id} className="surface-card card-interactive p-6">
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
    </div>
  );
}
