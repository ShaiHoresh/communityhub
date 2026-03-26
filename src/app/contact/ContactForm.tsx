"use client";

import { useActionState } from "react";
import { submitContactAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";

type Props = {
  defaultName?: string;
  defaultEmail?: string;
};

export function ContactForm({ defaultName, defaultEmail }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => submitContactAction(formData),
    null as { ok: boolean; error?: string } | null,
  );

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <p className="font-heading text-lg font-bold text-green-800">ההודעה נשלחה בהצלחה!</p>
        <p className="mt-2 text-sm text-green-700">
          נחזור אליך בהקדם האפשרי. תודה שפנית אלינו.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-foreground">
            שם מלא *
          </label>
          <input
            id="contact-name"
            name="name"
            required
            defaultValue={defaultName}
            className="input-base"
            placeholder="ישראל ישראלי"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-foreground">
            אימייל *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            className="input-base"
            placeholder="israel@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-foreground">
          נושא *
        </label>
        <input
          id="contact-subject"
          name="subject"
          required
          className="input-base"
          placeholder="למשל: שאלה על מועדי תפילה"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-foreground">
          הודעה *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="input-base resize-none"
          placeholder="כתוב את הודעתך כאן…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "שולח…" : "שליחת הודעה"}
        </button>
        <div aria-live="polite" aria-atomic="true">
          <FormError message={state?.error} />
        </div>
      </div>
    </form>
  );
}
