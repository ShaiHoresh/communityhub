"use client";

import { useActionState } from "react";
import type { GmachCategory } from "@/lib/gmach-categories";
import { addGmachItemAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

type Props = { categories: GmachCategory[] };

export function GmachAddForm({ categories }: Props) {
  const [state, formAction] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
      return await addGmachItemAction(formData);
    },
    null
  );

  return (
    <form action={formAction} className="mt-6 space-y-4 border-t border-secondary/20 pt-6">
      <h3 className="text-sm font-semibold text-foreground">הוספת פריט למודעות</h3>
      <div>
        <label htmlFor="categoryId" className="mb-1 block text-xs font-medium text-primary/80">
          קטגוריה
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="mb-1 block text-xs font-medium text-primary/80">
          כותרת
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-xs font-medium text-primary/80">
          תיאור (אופציונלי)
        </label>
        <input
          id="description"
          name="description"
          type="text"
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <div>
        <label htmlFor="contactInfo" className="mb-1 block text-xs font-medium text-primary/80">
          ליצירת קשר (אופציונלי)
        </label>
        <input
          id="contactInfo"
          name="contactInfo"
          type="text"
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <div aria-live="polite" aria-atomic="true">
        <FormError message={state?.error} />
        {state?.ok && <FormSuccess message="הפריט נוסף." />}
      </div>
      <button type="submit" className="btn-primary text-sm">
        הוספה
      </button>
    </form>
  );
}
