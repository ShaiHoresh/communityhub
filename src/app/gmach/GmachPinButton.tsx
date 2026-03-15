"use client";

import { useTransition } from "react";
import { toggleGmachPinAction } from "./actions";

type Props = { itemId: string; isPinned: boolean };

export function GmachPinButton({ itemId, isPinned }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() => toggleGmachPinAction(itemId))
      }
      disabled={isPending}
      title={isPinned ? "הסר מסימון עדיפות ועדה" : "סמן כעדיפות ועדה"}
      className={`rounded-full px-2 py-1 text-xs font-medium transition ${
        isPinned
          ? "bg-accent text-white"
          : "border border-secondary/50 bg-secondary/10 text-primary hover:bg-secondary/20"
      } disabled:opacity-50`}
    >
      {isPending ? "…" : isPinned ? "מסומן" : "סמן עדיפות"}
    </button>
  );
}
