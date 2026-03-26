"use client";

import { useActionState } from "react";
import { addDvarTorahAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

export function DvarTorahForm() {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => addDvarTorahAction(formData),
    null as { ok: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dt-title" className="mb-1 block text-xs font-medium text-primary/80">
            כותרת *
          </label>
          <input
            id="dt-title"
            name="title"
            required
            placeholder="נושא דבר התורה"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="dt-author" className="mb-1 block text-xs font-medium text-primary/80">
            מחבר / דרשן
          </label>
          <input
            id="dt-author"
            name="author"
            placeholder="הרב ישראל ישראלי"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="dt-parasha" className="mb-1 block text-xs font-medium text-primary/80">
            פרשה
          </label>
          <input
            id="dt-parasha"
            name="parasha"
            placeholder="בראשית, לך לך…"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="dt-date" className="mb-1 block text-xs font-medium text-primary/80">
            תאריך *
          </label>
          <input id="dt-date" name="date" type="date" required className="input-base" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dt-body" className="mb-1 block text-xs font-medium text-primary/80">
            תוכן *
          </label>
          <textarea
            id="dt-body"
            name="body"
            required
            rows={6}
            placeholder="כתוב כאן את דבר התורה…"
            className="input-base resize-y"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={isPending}>
          {isPending ? "שומר…" : "פרסום"}
        </button>
        <div aria-live="polite" aria-atomic="true">
          <FormError message={state?.error} />
          {state?.ok && <FormSuccess message="פורסם בהצלחה." />}
        </div>
      </div>
    </form>
  );
}
