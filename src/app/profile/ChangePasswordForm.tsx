"use client";

import { useActionState } from "react";
import { changePasswordAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, fd: FormData) => changePasswordAction(fd),
    null as { ok: boolean; error?: string } | null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="profile-current-pw"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          סיסמה נוכחית *
        </label>
        <input
          id="profile-current-pw"
          name="currentPassword"
          type="password"
          required
          className="input-base"
          autoComplete="current-password"
          dir="ltr"
        />
      </div>

      <div>
        <label
          htmlFor="profile-new-pw"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          סיסמה חדשה *
        </label>
        <input
          id="profile-new-pw"
          name="newPassword"
          type="password"
          required
          minLength={8}
          className="input-base"
          autoComplete="new-password"
          dir="ltr"
        />
        <p className="mt-1 text-xs text-primary/60">לפחות 8 תווים.</p>
      </div>

      <div>
        <label
          htmlFor="profile-confirm-pw"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          אישור סיסמה חדשה *
        </label>
        <input
          id="profile-confirm-pw"
          name="confirmPassword"
          type="password"
          required
          className="input-base"
          autoComplete="new-password"
          dir="ltr"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="btn-secondary">
          {isPending ? "מעדכן…" : "עדכון סיסמה"}
        </button>
        <div aria-live="polite" aria-atomic="true">
          {state?.ok === true && <FormSuccess message="הסיסמה שונתה בהצלחה." />}
          {state?.error && <FormError message={state.error} />}
        </div>
      </div>
    </form>
  );
}
