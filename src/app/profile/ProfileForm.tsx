"use client";

import { useActionState } from "react";
import { updateProfileAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

type Props = {
  defaultFullName: string;
  defaultPhone: string;
  defaultShowPhone: boolean;
  defaultShowEmail: boolean;
  email?: string;
};

export function ProfileForm({
  defaultFullName,
  defaultPhone,
  defaultShowPhone,
  defaultShowEmail,
  email,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, fd: FormData) => updateProfileAction(fd),
    null as { ok: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-foreground">
          שם מלא *
        </label>
        <input
          id="profile-name"
          name="fullName"
          required
          defaultValue={defaultFullName}
          className="input-base"
        />
      </div>

      <div>
        <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-foreground">
          אימייל
        </label>
        <input
          id="profile-email"
          value={email ?? ""}
          readOnly
          disabled
          className="input-base cursor-not-allowed opacity-60"
        />
        <p className="mt-1 text-xs text-primary/60">האימייל אינו ניתן לשינוי.</p>
      </div>

      <div>
        <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium text-foreground">
          טלפון
        </label>
        <input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={defaultPhone}
          className="input-base"
          placeholder="050-1234567"
          dir="ltr"
        />
      </div>

      <fieldset className="rounded-xl border border-secondary/30 p-4">
        <legend className="px-1 text-sm font-semibold text-foreground">הגדרות פרטיות</legend>
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              name="showPhoneInDir"
              defaultChecked={defaultShowPhone}
              className="h-4 w-4 rounded accent-primary"
            />
            הצג טלפון במדריך הקהילה
          </label>
          <label className="flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              name="showEmailInDir"
              defaultChecked={defaultShowEmail}
              className="h-4 w-4 rounded accent-primary"
            />
            הצג אימייל במדריך הקהילה
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "שומר…" : "שמירת שינויים"}
        </button>
        <div aria-live="polite" aria-atomic="true">
          {state?.ok === true && <FormSuccess message="הפרטים עודכנו בהצלחה." />}
          {state?.error && <FormError message={state.error} />}
        </div>
      </div>
    </form>
  );
}
