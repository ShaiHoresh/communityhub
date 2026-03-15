"use client";

import { useActionState } from "react";
import { submitLifeEventAction } from "./actions";

export function LifeEventForm() {
  const [state, formAction] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return await submitLifeEventAction(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="type" className="mb-2 block text-sm font-medium text-foreground">
          סוג אירוע
        </label>
        <select
          id="type"
          name="type"
          required
          className="w-full rounded-xl border border-secondary/40 bg-white px-4 py-2.5 text-right text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="birth">יום הולדת</option>
          <option value="yahrzeit">אזכרה (יארצייט)</option>
        </select>
      </div>
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
          שם
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="שם הפרט או המשפחה"
          className="w-full rounded-xl border border-secondary/40 bg-white px-4 py-2.5 text-right text-foreground placeholder:text-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="date" className="mb-2 block text-sm font-medium text-foreground">
          תאריך (לידה או פטירה)
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          className="w-full rounded-xl border border-secondary/40 bg-white px-4 py-2.5 text-right text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
          הערות (אופציונלי)
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="פרטים נוספים"
          className="w-full rounded-xl border border-secondary/40 bg-white px-4 py-2.5 text-right text-foreground placeholder:text-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-primary">האירוע נרשם בהצלחה.</p>
      )}
      <button type="submit" className="btn-primary">
        הוספת אירוע
      </button>
    </form>
  );
}
