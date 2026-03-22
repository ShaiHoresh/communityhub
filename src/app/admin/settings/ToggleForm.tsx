"use client";

import { useActionState } from "react";
import { toggleModuleAction } from "./actions";
import type { SeasonalModule } from "@/lib/system-toggles";
import { FormError, FormSuccess } from "@/components/FormFeedback";

type Props = {
  initialToggles: Record<SeasonalModule, boolean>;
  labels: Record<SeasonalModule, string>;
};

export function ToggleForm({ initialToggles, labels }: Props) {
  const [state, formAction] = useActionState(toggleModuleAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {(Object.entries(initialToggles) as [SeasonalModule, boolean][]).map(
        ([key, enabled]) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-secondary/20 bg-white/50 p-4 transition hover:border-primary/30 focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2"
          >
            <input
              type="checkbox"
              name="module"
              value={key}
              defaultChecked={enabled}
              className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
            />
            <span className="font-medium text-foreground">{labels[key]}</span>
          </label>
        )
      )}
      <button type="submit" className="btn-primary mt-4">
        שמירה
      </button>
      <div aria-live="polite" aria-atomic="true">
        {state?.ok && <FormSuccess message="נשמר בהצלחה." />}
        <FormError message={state?.error} />
      </div>
    </form>
  );
}
