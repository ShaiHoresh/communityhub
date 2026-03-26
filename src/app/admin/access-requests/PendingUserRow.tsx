"use client";

import { useState, useTransition } from "react";
import { approvePendingUserAction } from "./actions";

type Household = { id: string; name: string };

type Props = {
  userId: string;
  fullName: string;
  email?: string;
  households: Household[];
};

export function PendingUserRow({ userId, fullName, email, households }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");

  function handleApprove() {
    startTransition(() => {
      void approvePendingUserAction(userId, selectedHouseholdId || undefined);
    });
  }

  return (
    <li className="surface-card card-interactive rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-heading font-semibold text-foreground">{fullName}</p>
          {email && <p className="mt-0.5 text-sm text-primary/85">{email}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor={`hh-${userId}`} className="sr-only">
              שיוך למשק בית
            </label>
            <select
              id={`hh-${userId}`}
              value={selectedHouseholdId}
              onChange={(e) => setSelectedHouseholdId(e.target.value)}
              disabled={isPending}
              className="rounded-xl border border-secondary/40 bg-white px-3 py-2 text-sm text-right text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">ללא שיוך למשק בית</option>
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="btn-primary py-2 px-4 text-sm"
          >
            {isPending ? "…" : "אישור (הפוך לחבר)"}
          </button>
        </div>
      </div>
    </li>
  );
}
