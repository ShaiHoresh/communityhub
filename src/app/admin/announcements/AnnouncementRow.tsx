"use client";

import { useTransition } from "react";
import type { DbAnnouncement } from "@/lib/db-announcements";
import { deleteAnnouncementAction, togglePinAction } from "./actions";

export function AnnouncementRow({ item }: { item: DbAnnouncement }) {
  const [isPending, startTransition] = useTransition();
  const isExpired = item.expiresAt ? item.expiresAt < new Date() : false;

  function handleDelete() {
    if (!confirm("למחוק מודעה זו?")) return;
    startTransition(() => void deleteAnnouncementAction(item.id));
  }

  function handleTogglePin() {
    startTransition(() => void togglePinAction(item.id, !item.isPinned));
  }

  return (
    <li
      className={`surface-card rounded-2xl p-5 ${
        isExpired ? "opacity-50" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {item.isPinned && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                📌 מוצמד
              </span>
            )}
            {isExpired && (
              <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-medium text-primary/60">
                פג תוקף
              </span>
            )}
            {item.expiresAt && !isExpired && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                תפוגה: {item.expiresAt.toLocaleDateString("he-IL")}
              </span>
            )}
          </div>
          <p className="font-heading font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-primary/80 line-clamp-2">{item.body}</p>
          <p className="mt-1.5 text-xs text-primary/50">
            {item.createdAt.toLocaleDateString("he-IL")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleTogglePin}
            disabled={isPending}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            {item.isPinned ? "הסר הצמדה" : "הצמד"}
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
