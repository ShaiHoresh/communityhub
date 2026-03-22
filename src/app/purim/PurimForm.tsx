"use client";

import { useActionState } from "react";
import { submitPurimSelection } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

type Household = { id: string; name: string };
type PreviousSelection = {
  tier: "full" | "twenty" | "five";
  recipientHouseholdIds: string[];
  createdAt: string;
} | null;

type Props = {
  households: Household[];
  previousSelection: PreviousSelection;
};

export function PurimForm({ households, previousSelection }: Props) {
  const [state, formAction] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
      return await submitPurimSelection(formData);
    },
    null,
  );

  const prevRecipients = new Set(previousSelection?.recipientHouseholdIds ?? []);

  return (
    <>
      <form action={formAction} className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <label className="card-interactive surface-card flex cursor-pointer flex-col items-stretch rounded-3xl border-2 border-transparent p-5 text-center hover:border-fuchsia-400 focus-within:ring-2 focus-within:ring-fuchsia-400/60 focus-within:ring-offset-2">
            <input
              type="radio"
              name="tier"
              value="full"
              defaultChecked={previousSelection?.tier === "full"}
              className="sr-only"
            />
            <span className="text-2xl">🌍</span>
            <span className="mt-2 font-heading text-base font-bold text-foreground">
              כל הקהילה
            </span>
            <span className="mt-1 text-xs text-primary/75">
              משלוח מנות לכל המשפחות הרשומות.
            </span>
          </label>

          <label className="card-interactive surface-card flex cursor-pointer flex-col items-stretch rounded-3xl border-2 border-transparent p-5 text-center hover:border-fuchsia-400 focus-within:ring-2 focus-within:ring-fuchsia-400/60 focus-within:ring-offset-2">
            <input
              type="radio"
              name="tier"
              value="twenty"
              defaultChecked={previousSelection?.tier === "twenty"}
              className="sr-only"
            />
            <span className="text-2xl">🎉</span>
            <span className="mt-2 font-heading text-base font-bold text-foreground">
              20 משפחות
            </span>
            <span className="mt-1 text-xs text-primary/75">
              בחרו עד 20 משפחות מתוך רשימת הקהילה.
            </span>
          </label>

          <label className="card-interactive surface-card flex cursor-pointer flex-col items-stretch rounded-3xl border-2 border-transparent p-5 text-center hover:border-fuchsia-400 focus-within:ring-2 focus-within:ring-fuchsia-400/60 focus-within:ring-offset-2">
            <input
              type="radio"
              name="tier"
              value="five"
              defaultChecked={
                !previousSelection || previousSelection.tier === "five"
              }
              className="sr-only"
            />
            <span className="text-2xl">🥳</span>
            <span className="mt-2 font-heading text-base font-bold text-foreground">
              5 משפחות
            </span>
            <span className="mt-1 text-xs text-primary/75">
              בחירה ממוקדת עד 5 משפחות אהובות.
            </span>
          </label>
        </section>

        <section className="surface-card card-interactive rounded-3xl p-6 sm:p-8">
          <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
            בחירת משפחות (לחבילות 5 / 20)
          </h2>
          <p className="mb-4 text-xs text-primary/80">
            כאשר נבחרת חבילת &quot;כל הקהילה&quot; אין צורך לסמן משפחות
            ספציפיות. לחבילות 5 / 20 ניתן לסמן עד 5 / 20 שמות (המערכת תבדוק
            זאת).
          </p>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1 text-sm">
            {households.length === 0 ? (
              <p className="text-primary/70">
                עדיין אין משפחות רשומות במערכת.
              </p>
            ) : (
              households.map((h) => (
                <label
                  key={h.id}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-fuchsia-50/80 px-3 py-2 text-primary/90 hover:bg-fuchsia-100 focus-within:ring-2 focus-within:ring-fuchsia-400/60 focus-within:ring-offset-2"
                >
                  <span className="font-medium">{h.name}</span>
                  <input
                    type="checkbox"
                    name="recipients"
                    value={h.id}
                    defaultChecked={prevRecipients.has(h.id)}
                    className="h-4 w-4 rounded border-fuchsia-400 text-fuchsia-600 focus:ring-fuchsia-500"
                  />
                </label>
              ))
            )}
          </div>
        </section>

        <div aria-live="polite" aria-atomic="true">
          <FormError message={state?.error} />
          {state?.ok && <FormSuccess message="הבחירה נשמרה בהצלחה." />}
        </div>

        <button type="submit" className="btn-primary">
          שמירת בחירת פורים
        </button>
      </form>

      {previousSelection && (
        <section className="mt-6 text-xs text-primary/70">
          <p>
            בחירה אחרונה עודכנה: {previousSelection.createdAt}
          </p>
        </section>
      )}
    </>
  );
}
