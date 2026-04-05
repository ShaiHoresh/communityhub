"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

type Props = { token: string };

const initialState: { ok: boolean; error?: string } = { ok: false };

export function ResetPasswordForm({ token }: Props) {
  const boundAction = resetPasswordAction.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  if (state.ok) {
    return (
      <div className="space-y-6">
        <FormSuccess message="הסיסמה שונתה בהצלחה! כעת ניתן להתחבר עם הסיסמה החדשה." />
        <Link href="/auth/signin" className="btn-primary inline-flex">
          התחברות
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <FormError message={state.error} />}

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
          סיסמה חדשה
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          disabled={isPending}
          placeholder="לפחות 8 תווים"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-right text-foreground placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-foreground">
          אישור סיסמה
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          disabled={isPending}
          placeholder="חזור על הסיסמה"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-right text-foreground placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "שומר…" : "שמור סיסמה חדשה"}
      </button>
    </form>
  );
}
