"use client";

import { useState, useTransition } from "react";
import type { Location } from "@/lib/locations";
import { deleteLocationAction, upsertLocationAction } from "./actions";

const CATEGORIES = [
  { value: "Indoor", label: "Indoor" },
  { value: "Covered", label: "Covered" },
  { value: "OpenAir", label: "Open-air" },
  { value: "Protected", label: "Protected" },
] as const;

export function LocationRow({ location }: { location: Location }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("למחוק מיקום זה?")) return;
    startTransition(() => {
      void deleteLocationAction(location.id);
    });
  }

  if (editing) {
    return (
      <li className="surface-card card-interactive rounded-2xl p-5">
        <form
          action={async (formData: FormData) => {
            await upsertLocationAction(formData);
            setEditing(false);
          }}
          className="grid gap-3 sm:grid-cols-5"
        >
          <input type="hidden" name="id" value={location.id} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-primary/80">שם</label>
            <input
              name="name"
              defaultValue={location.name}
              required
              className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-primary/80">קיבולת</label>
            <input
              name="maxCapacity"
              type="number"
              min={0}
              defaultValue={location.maxCapacity}
              required
              className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-primary/80">סוג מרחב</label>
            <select
              name="spaceCategory"
              defaultValue={location.spaceCategory}
              className="w-full rounded-lg border border-secondary/40 bg-white px-3 py-2 text-right text-foreground"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary text-sm py-2 px-3">
              שמירה
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-secondary text-sm py-2 px-3"
            >
              ביטול
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="surface-card card-interactive flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
      <div className="min-w-0">
        <p className="font-heading font-semibold text-foreground">{location.name}</p>
        <p className="mt-1 text-sm text-primary/80">
          id: <span className="font-mono">{location.id}</span> · קיבולת: {location.maxCapacity} · סוג:{" "}
          {location.spaceCategory}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={isPending}
          className="btn-secondary text-sm py-2 px-3"
        >
          עריכה
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 disabled:opacity-60 dark:border-red-900/40 dark:bg-zinc-950 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          מחיקה
        </button>
      </div>
    </li>
  );
}

