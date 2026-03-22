"use client";

import { useActionState } from "react";
import { addEntryAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import type { ScheduleEntryType } from "@/lib/schedule-entries";
import type { Location } from "@/lib/locations";

const ENTRY_TYPES: { value: ScheduleEntryType; label: string }[] = [
  { value: "shacharit", label: "שחרית" },
  { value: "mincha", label: "מנחה" },
  { value: "arvit", label: "ערבית" },
  { value: "lesson", label: "שיעור" },
];

type Props = {
  locations: Location[];
};

export function ScheduleEntryForm({ locations }: Props) {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return addEntryAction(formData);
    },
    null as { ok: boolean; error?: string } | null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-semibold text-foreground">
            סוג
          </label>
          <select
            id="type"
            name="type"
            required
            className="w-full rounded-xl border border-secondary/30 bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-semibold text-foreground">
            כותרת
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="למשל: שיעור גמרא"
            className="w-full rounded-xl border border-secondary/30 bg-white px-3 py-2 text-foreground placeholder:text-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="locationId" className="mb-1 block text-sm font-semibold text-foreground">
            מיקום
          </label>
          <select
            id="locationId"
            name="locationId"
            required
            className="w-full rounded-xl border border-secondary/30 bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hour" className="mb-1 block text-sm font-semibold text-foreground">
            שעה
          </label>
          <input
            id="hour"
            name="hour"
            type="number"
            min={0}
            max={23}
            required
            defaultValue={8}
            className="w-full rounded-xl border border-secondary/30 bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="minute" className="mb-1 block text-sm font-semibold text-foreground">
            דקה
          </label>
          <input
            id="minute"
            name="minute"
            type="number"
            min={0}
            max={59}
            required
            defaultValue={0}
            className="w-full rounded-xl border border-secondary/30 bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="useSeasonalMinchaOffset"
            className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-foreground">מנחה: התאמה עונתית (15 דק׳)</span>
        </label>
      </div>
      <button type="submit" className="btn-primary">
        הוספת רשומה
      </button>
      <FormError message={state?.error} />
      {state?.ok && <FormSuccess message="נוסף בהצלחה." />}
    </form>
  );
}
