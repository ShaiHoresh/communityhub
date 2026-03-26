"use client";

import { useActionState } from "react";
import { addSpotlightAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

type Household = { id: string; name: string };

export function SpotlightForm({ households }: { households: Household[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => addSpotlightAction(formData),
    null as { ok: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sp-household" className="mb-1 block text-xs font-medium text-primary/80">
            משק בית *
          </label>
          <select id="sp-household" name="householdId" required className="input-base">
            <option value="">-- בחר משק בית --</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sp-photo" className="mb-1 block text-xs font-medium text-primary/80">
            כתובת תמונה (URL, אופציונלי)
          </label>
          <input
            id="sp-photo"
            name="photoUrl"
            type="url"
            placeholder="https://..."
            className="input-base"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sp-bio" className="mb-1 block text-xs font-medium text-primary/80">
            תיאור משפחה *
          </label>
          <textarea
            id="sp-bio"
            name="bio"
            required
            rows={4}
            placeholder="ספרו על המשפחה – ותיקים, קשרים עם הקהילה, שמחות…"
            className="input-base resize-y"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={isPending}>
          {isPending ? "שומר…" : "הוספה"}
        </button>
        <div aria-live="polite" aria-atomic="true">
          <FormError message={state?.error} />
          {state?.ok && <FormSuccess message="נוסף. כדי להפעיל, לחצו 'הפעל' ברשימה." />}
        </div>
      </div>
    </form>
  );
}
