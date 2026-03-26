"use client";

import { useState, useTransition } from "react";
import type { Location } from "@/lib/locations";
import { deleteLocationAction, upsertLocationAction } from "./actions";

const CATEGORIES = [
  { value: "Indoor", label: "פנים" },
  { value: "Covered", label: "חוץ מקורה" },
  { value: "OpenAir", label: "חוץ פתוח" },
  { value: "Protected", label: "מרחב מוגן" },
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
          מזהה: <span className="font-mono">{location.id}</span> · קיבולת: {location.maxCapacity} · סוג:{" "}
          {CATEGORIES.find((c) => c.value === location.spaceCategory)?.label ?? location.spaceCategory}
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
          className="btn-danger py-2 px-3 text-sm"
        >
          מחיקה
        </button>
      </div>
    </li>
  );
}

