"use client";

import { useTransition } from "react";
import type { DbContactMessage } from "@/lib/db-contact";
import { markReadAction, deleteContactMessageAction } from "./actions";

export function ContactMessageRow({ msg }: { msg: DbContactMessage }) {
  const [isPending, startTransition] = useTransition();

  function handleToggleRead() {
    startTransition(() => void markReadAction(msg.id, !msg.isRead));
  }

  function handleDelete() {
    if (!confirm("למחוק הודעה זו לצמיתות?")) return;
    startTransition(() => void deleteContactMessageAction(msg.id));
  }

  return (
    <li
      className={`surface-card rounded-2xl p-5 transition-opacity ${
        msg.isRead ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {!msg.isRead && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                חדש
              </span>
            )}
            <span className="text-xs text-primary/55">
              {msg.createdAt.toLocaleString("he-IL", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="font-heading font-semibold text-foreground">{msg.subject}</p>
          <p className="mt-0.5 text-sm text-primary/75">
            {msg.name}
            {" · "}
            <a href={`mailto:${msg.email}`} className="underline hover:text-primary">
              {msg.email}
            </a>
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {msg.message}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleToggleRead}
            disabled={isPending}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            {msg.isRead ? "סמן כלא נקרא" : "סמן כנקרא"}
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
