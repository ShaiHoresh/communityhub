"use client";

import { useTransition } from "react";
import type { DbDvarTorah } from "@/lib/db-dvar-torah";
import { deleteDvarTorahAction } from "./actions";

export function DvarTorahRow({ item }: { item: DbDvarTorah }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("למחוק דבר תורה זה?")) return;
    startTransition(() => void deleteDvarTorahAction(item.id));
  }

  return (
    <li className="surface-card rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {item.parasha && (
              <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary">
                פרשת {item.parasha}
              </span>
            )}
            <span className="text-xs text-primary/60">
              {item.date.toLocaleDateString("he-IL")}
            </span>
          </div>
          <p className="font-heading font-semibold text-foreground">{item.title}</p>
          {item.author && (
            <p className="mt-0.5 text-sm text-primary/70">{item.author}</p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-primary/80 line-clamp-3">{item.body}</p>
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
