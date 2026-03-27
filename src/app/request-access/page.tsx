import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { BackLink } from "@/components/BackLink";
import { requestAccessAction } from "./actions";

export const metadata = {
  title: "בקשת גישה | ����� �����",
  description: "בקשת הצטרפות למשק בית או פתיחת משק בית חדש",
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function RequestAccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const errorMsg = params.error ? decodeURIComponent(params.error) : null;

  return (
    <main id="main-content" className="mx-auto max-w-xl px-6 py-10 text-right">
        <BackLink />
        <PageHeading
          title="בקשת גישה למערכת"
          subtitle="מלאו את הפרטים להצטרפות למשק בית קיים או לפתיחת משק בית חדש. הבקשה תעבור לאישור הנהלת הקהילה."
        />

        <div className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        {errorMsg && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {errorMsg}
          </div>
        )}
        <form action={requestAccessAction} className="space-y-6">
          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-foreground">
              סוג הבקשה
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-right text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-600 dark:bg-zinc-900"
            >
              <option value="new_household">משק בית חדש</option>
              <option value="join_household">הצטרפות למשק בית קיים</option>
            </select>
          </div>

          <div id="household-field">
            <label htmlFor="householdNameOrId" className="mb-2 block text-sm font-medium text-foreground">
              שם משק הבית (חדש) או מזהה משק בית (הצטרפות)
            </label>
            <input
              id="householdNameOrId"
              name="householdNameOrId"
              type="text"
              required
              placeholder="לדוגמה: משפחת לוי"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-right text-foreground placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </div>

          <div className="rounded-xl border border-secondary/40 bg-secondary/20 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">פרטי המבקש</h2>
            <div>
              <label htmlFor="requesterName" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                שם מלא
              </label>
              <input
                id="requesterName"
                name="requesterName"
                type="text"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-foreground dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="requesterEmail" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                אימייל
              </label>
              <input
                id="requesterEmail"
                name="requesterEmail"
                type="email"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-foreground dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="requesterPhone" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                טלפון (אופציונלי)
              </label>
              <input
                id="requesterPhone"
                name="requesterPhone"
                type="tel"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-foreground dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">
              בן/בת זוג (אופציונלי – שניכם יוכלו לנהל את המשק)
            </h2>
            <div>
              <label htmlFor="secondAdultName" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                שם
              </label>
              <input
                id="secondAdultName"
                name="secondAdultName"
                type="text"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-foreground dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="secondAdultEmail" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                אימייל
              </label>
              <input
                id="secondAdultEmail"
                name="secondAdultEmail"
                type="email"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-foreground dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label htmlFor="secondAdultPhone" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                טלפון
              </label>
              <input
                id="secondAdultPhone"
                name="secondAdultPhone"
                type="tel"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-right text-foreground dark:border-zinc-600 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
              הערות (אופציונלי)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-right text-foreground placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-600 dark:bg-zinc-900"
              placeholder="מידע נוסף שיכול לסייע לאישור הבקשה"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              שליחת הבקשה
            </button>
            <Link href="/" className="btn-secondary">
              ביטול
            </Link>
          </div>
        </form>
        </div>
    </main>
  );
}
