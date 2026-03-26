"use client";

import { useActionState } from "react";
import { addMazalTovAction } from "./actions";
import { MAZAL_TOV_EVENT_LABELS } from "@/lib/db-mazal-tov";
import { FormError, FormSuccess } from "@/components/FormFeedback";

export function MazalTovForm() {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => addMazalTovAction(formData),
    null as { ok: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mt-type" className="mb-1 block text-xs font-medium text-primary/80">
            סוג אירוע *
          </label>
          <select id="mt-type" name="eventType" required className="input-base">
            {Object.entries(MAZAL_TOV_EVENT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mt-date" className="mb-1 block text-xs font-medium text-primary/80">
            תאריך *
          </label>
          <input id="mt-date" name="date" type="date" required className="input-base" />
        </div>
        <div>
          <label htmlFor="mt-name" className="mb-1 block text-xs font-medium text-primary/80">
            שם / משפחה *
          </label>
          <input
            id="mt-name"
            name="name"
            required
            placeholder="למשל: משפחת כהן"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="mt-msg" className="mb-1 block text-xs font-medium text-primary/80">
            ברכה (אופציונלי)
          </label>
          <input
            id="mt-msg"
            name="message"
            placeholder="מזל טוב ואורך ימים!"
            className="input-base"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={isPending}>
          {isPending ? "שומר…" : "הוספה"}
        </button>
        <div aria-live="polite" aria-atomic="true">
          <FormError message={state?.error} />
          {state?.ok && <FormSuccess message="נוסף בהצלחה." />}
        </div>
      </div>
    </form>
  );
}
