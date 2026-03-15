"use client";

import { useTransition } from "react";
import { approvePendingUserAction } from "./actions";

type Props = { userId: string; fullName: string; email?: string };

export function PendingUserRow({ userId, fullName, email }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(() => {
      void approvePendingUserAction(userId);
    });
  }

  return (
    <li className="surface-card card-interactive flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
      <div>
        <p className="font-heading font-semibold text-foreground">{fullName}</p>
        {email && <p className="mt-0.5 text-sm text-primary/85">{email}</p>}
      </div>
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className="btn-primary py-2 px-4 text-sm"
      >
        {isPending ? "…" : "אישור (הפוך לחבר)"}
      </button>
    </li>
  );
}
