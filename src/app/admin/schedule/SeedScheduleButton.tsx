"use client";

import { useTransition } from "react";
import { seedDefaultScheduleAction } from "./actions";

type Props = { className?: string };

export function SeedScheduleButton({ className }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await seedDefaultScheduleAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`btn-secondary ${className ?? ""}`}
    >
      {isPending ? "…" : "טען ברירת מחדל (שחרית, מנחה, ערבית)"}
    </button>
  );
}
