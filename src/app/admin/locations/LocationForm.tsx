"use client";

import { useActionState } from "react";
import { upsertLocationAction } from "./actions";

const CATEGORIES = [
  { value: "Indoor", label: "Indoor (פנים)" },
  { value: "Covered", label: "Covered (חוץ מקורה)" },
  { value: "OpenAir", label: "Open-air (חוץ פתוח)" },
  { value: "Protected", label: "Protected space (מרחב מוגן)" },
] as const;

export function LocationForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return await upsertLocationAction(formData);
    },
    null as { ok: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-4">
      <div className="sm:col-span-1">
        <label htmlFor="loc-id" className="mb-1 block text-xs font-medium text-primary/80">
          מזהה (id)
        </label>
        <input
          id="loc-id"
          name="id"
          required
          placeholder="main-hall"
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="loc-name" className="mb-1 block text-xs font-medium text-primary/80">
          שם
        </label>
        <input
          id="loc-name"
          name="name"
          required
          placeholder="אולם מרכזי"
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="loc-cap" className="mb-1 block text-xs font-medium text-primary/80">
          קיבולת
        </label>
        <input
          id="loc-cap"
          name="maxCapacity"
          type="number"
          min={0}
          required
          defaultValue={0}
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="loc-cat" className="mb-1 block text-xs font-medium text-primary/80">
          סוג מרחב
        </label>
        <select
          id="loc-cat"
          name="spaceCategory"
          required
          defaultValue="Indoor"
          className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-4 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary text-sm">
          שמירה
        </button>
        <div aria-live="polite" aria-atomic="true">
          {state?.error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {state.error}
            </p>
          )}
          {state?.ok && <p className="text-sm font-medium text-primary">נשמר.</p>}
        </div>
      </div>
    </form>
  );
}

