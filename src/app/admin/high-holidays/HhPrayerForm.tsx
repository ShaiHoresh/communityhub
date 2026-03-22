"use client";

import { useActionState } from "react";
import { addHhPrayerAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

export function HhPrayerForm() {
  const [state, formAction] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
      return await addHhPrayerAction(formData);
    },
    null,
  );

  return (
    <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-secondary/20 pt-4">
      <div className="flex-1">
        <label htmlFor="prayer-name" className="mb-1 block text-xs font-medium text-primary/80">
          שם התפילה
        </label>
        <input
          id="prayer-name"
          name="name"
          type="text"
          required
          placeholder="לדוגמה: שחרית ראש השנה א׳"
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <div className="w-24">
        <label htmlFor="prayer-sort" className="mb-1 block text-xs font-medium text-primary/80">
          סדר
        </label>
        <input
          id="prayer-sort"
          name="sortOrder"
          type="number"
          defaultValue={0}
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <button type="submit" className="btn-primary text-sm">
        הוספה
      </button>
      <FormError message={state?.error} />
      {state?.ok && <FormSuccess message="התפילה נוספה." />}
    </form>
  );
}
