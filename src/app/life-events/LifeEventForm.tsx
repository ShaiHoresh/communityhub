"use client";

import { useActionState } from "react";
import { submitLifeEventAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

export function LifeEventForm() {
  const [state, formAction] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
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
          className="input-base"
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
          className="input-base placeholder:text-primary/50"
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
          className="input-base"
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
          className="input-base placeholder:text-primary/50"
        />
      </div>
      <div aria-live="polite" aria-atomic="true">
        <FormError message={state?.error} />
        {state?.ok && <FormSuccess message="האירוע נרשם בהצלחה." />}
      </div>
      <button type="submit" className="btn-primary">
        הוספת אירוע
      </button>
    </form>
  );
}
