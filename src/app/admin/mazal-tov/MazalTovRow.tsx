"use client";

import { useTransition } from "react";
import type { DbMazalTov } from "@/lib/db-mazal-tov";
import { MAZAL_TOV_EVENT_LABELS } from "@/lib/db-mazal-tov";
import { deleteMazalTovAction } from "./actions";

export function MazalTovRow({ item }: { item: DbMazalTov }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("למחוק רשומה זו?")) return;
    startTransition(() => void deleteMazalTovAction(item.id));
  }

  return (
    <li className="surface-card rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {MAZAL_TOV_EVENT_LABELS[item.eventType]}
            </span>
            <span className="text-xs text-primary/60">
              {item.date.toLocaleDateString("he-IL")}
            </span>
          </div>
          <p className="font-heading font-semibold text-foreground">{item.name}</p>
          {item.message && (
            <p className="mt-0.5 text-sm text-primary/75">{item.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="btn-danger shrink-0 py-1.5 px-3 text-sm"
        >
          מחיקה
        </button>
      </div>
    </li>
  );
}
