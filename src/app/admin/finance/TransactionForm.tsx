"use client";

import { useActionState, useState } from "react";
import { addTransactionAction } from "./actions";

type Props = { projectId: string };

export function TransactionForm({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return await addTransactionAction(formData);
    },
    null
  );

  return (
    <div className="shrink-0">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-secondary py-2 px-4 text-sm"
        >
          הוסף הכנסה/הוצאה
        </button>
      ) : (
        <form
          action={formAction}
          className="flex flex-wrap items-end gap-2 rounded-lg border border-secondary/30 bg-secondary/5 p-3"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <div>
            <label className="mb-1 block text-xs text-primary/80">סוג</label>
            <select
              name="type"
              required
              className="rounded border border-secondary/40 bg-white px-2 py-1.5 text-sm text-foreground"
            >
              <option value="income">הכנסה</option>
              <option value="expense">הוצאה</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-primary/80">סכום (₪)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="w-24 rounded border border-secondary/40 bg-white px-2 py-1.5 text-right text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-primary/80">תיאור</label>
            <input
              name="description"
              type="text"
              className="w-40 rounded border border-secondary/40 bg-white px-2 py-1.5 text-right text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-primary/80">תאריך</label>
            <input
              name="date"
              type="date"
              className="rounded border border-secondary/40 bg-white px-2 py-1.5 text-sm text-foreground"
            />
          </div>
          <button type="submit" className="btn-primary py-2 px-3 text-sm">
            שמור
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          >
            ביטול
          </button>
          <div aria-live="polite" aria-atomic="true" className="w-full">
            {state?.error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {state.error}
              </p>
            )}
            {state?.success && (
              <p className="text-sm font-medium text-primary">
                נרשם.{" "}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="underline"
                >
                  סגור
                </button>
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
