"use client";

import { useTransition } from "react";
import type { DbSpotlight } from "@/lib/db-spotlight";
import { setActiveSpotlightAction, deleteSpotlightAction } from "./actions";

export function SpotlightRow({ item }: { item: DbSpotlight }) {
  const [isPending, startTransition] = useTransition();

  function handleActivate() {
    startTransition(() => void setActiveSpotlightAction(item.isActive ? null : item.id));
  }

  function handleDelete() {
    if (!confirm("למחוק רשומה זו?")) return;
    startTransition(() => void deleteSpotlightAction(item.id));
  }

  return (
    <li
      className={`surface-card rounded-2xl p-5 ${
        item.isActive ? "ring-2 ring-primary/30 ring-offset-2" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {item.isActive && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                ✓ פעיל
              </span>
            )}
            <span className="text-xs text-primary/60">
              {item.createdAt.toLocaleDateString("he-IL")}
            </span>
          </div>
          <p className="font-heading font-semibold text-foreground">
            {item.householdName ?? item.householdId}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-primary/80 line-clamp-2">{item.bio}</p>
          {item.photoUrl && (
            <p className="mt-1 truncate text-xs text-primary/50">{item.photoUrl}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleActivate}
            disabled={isPending}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            {item.isActive ? "כיבוי" : "הפעל"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="btn-danger py-1.5 px-3 text-sm"
          >
            מחיקה
          </button>
        </div>
      </div>
    </li>
  );
}
