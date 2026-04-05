"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

const initialState: { ok: boolean; error?: string; resetUrl?: string } = { ok: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  // Success state: either we sent email (resetUrl absent) or we show the link
  if (state.ok) {
    return (
      <div className="space-y-6">
        <FormSuccess message={
          state.resetUrl
            ? "הטוקן נוצר. העתק את הקישור הבא לאיפוס הסיסמה:"
            : "אם האימייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה. בדוק את תיבת הדואר שלך."
        } />

        {state.resetUrl && (
          <div className="space-y-3">
            <p className="text-xs text-foreground/60">
              (שירות דואר אלקטרוני לא מוגדר — הקישור מוצג כאן לשימוש ישיר)
            </p>
            <a
              href={state.resetUrl}
              className="btn-primary block text-center"
            >
              לחץ כאן לאיפוס הסיסמה
            </a>
            <details className="rounded-xl border border-secondary/30 bg-secondary/5 p-3">
              <summary className="cursor-pointer text-xs text-primary/70">
                העתק קישור ידנית
              </summary>
              <p className="mt-2 break-all rounded bg-secondary/10 p-2 font-mono text-xs">
                {state.resetUrl}
              </p>
            </details>
          </div>
        )}

        <Link href="/auth/signin" className="btn-secondary inline-flex">
          חזרה להתחברות
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormError message={state.error} />}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
          כתובת אימייל
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isPending}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-right text-foreground placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
        >
          {isPending ? "שולח…" : "שלח קישור לאיפוס"}
        </button>
        <Link href="/auth/signin" className="btn-secondary">
          חזרה להתחברות
        </Link>
      </div>
    </form>
  );
}
