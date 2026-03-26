"use client";

import { useActionState } from "react";
import { addAnnouncementAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

export function AnnouncementForm() {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => addAnnouncementAction(formData),
    null as { ok: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="ann-title" className="mb-1 block text-xs font-medium text-primary/80">
            כותרת *
          </label>
          <input
            id="ann-title"
            name="title"
            required
            placeholder="למשל: שינוי שעות התפילה"
            className="input-base"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ann-body" className="mb-1 block text-xs font-medium text-primary/80">
            תוכן *
          </label>
          <textarea
            id="ann-body"
            name="body"
            required
            rows={3}
            placeholder="פרטי המודעה..."
            className="input-base resize-none"
          />
        </div>
        <div>
          <label htmlFor="ann-expires" className="mb-1 block text-xs font-medium text-primary/80">
            תפוגה (אופציונלי)
          </label>
          <input
            id="ann-expires"
            name="expiresAt"
            type="datetime-local"
            className="input-base"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="isPinned"
              className="checkbox-base"
            />
            הצמד לראש (סדר עדיפות)
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={isPending}>
          {isPending ? "שומר…" : "פרסום מודעה"}
        </button>
        <div aria-live="polite" aria-atomic="true">
          <FormError message={state?.error} />
          {state?.ok && <FormSuccess message="המודעה פורסמה." />}
        </div>
      </div>
    </form>
  );
}
