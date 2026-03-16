"use client";

import { useState } from "react";
import { updateEntryAction, deleteEntryAction } from "./actions";
import type { ScheduleEntry } from "@/lib/schedule-entries";
import type { Location } from "@/lib/locations";

const TYPE_LABELS: Record<string, string> = {
  shacharit: "שחרית",
  mincha: "מנחה",
  arvit: "ערבית",
  lesson: "שיעור",
};

type Props = {
  entry: ScheduleEntry;
  locations: Location[];
};

export function ScheduleEntryRow({ entry, locations }: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("למחוק רשומה זו?")) return;
    setDeleting(true);
    await deleteEntryAction(entry.id);
    setDeleting(false);
  }

  async function handleEdit(formData: FormData) {
    await updateEntryAction(entry.id, formData);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="surface-card card-interactive rounded-2xl p-5">
        <form action={handleEdit} className="space-y-3">
          <input type="hidden" name="type" value={entry.type} />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              name="title"
              defaultValue={entry.title}
              required
              className="w-full rounded-lg border border-secondary/30 bg-white px-3 py-2 text-sm"
            />
            <select
              name="locationId"
              defaultValue={entry.locationId}
              required
              className="w-full rounded-lg border border-secondary/30 bg-white px-3 py-2 text-sm"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              name="hour"
              type="number"
              min={0}
              max={23}
              defaultValue={entry.hour}
              className="w-20 rounded-lg border border-secondary/30 bg-white px-2 py-1 text-sm"
            />
            <span className="self-center text-primary/70">:</span>
            <input
              name="minute"
              type="number"
              min={0}
              max={59}
              defaultValue={entry.minute}
              className="w-20 rounded-lg border border-secondary/30 bg-white px-2 py-1 text-sm"
            />
            {entry.type === "mincha" && (
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  name="useSeasonalMinchaOffset"
                  defaultChecked={entry.useSeasonalMinchaOffset}
                  className="h-3 w-3"
                />
                עונתי
              </label>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm py-1.5 px-3">שמירה</button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              ביטול
            </button>
          </div>
        </form>
      </li>
    );
  }

  const locationName = locations.find((l) => l.id === entry.locationId)?.name ?? entry.locationId;
  const timeStr = `${String(entry.hour).padStart(2, "0")}:${String(entry.minute).padStart(2, "0")}`;

  return (
    <li className="surface-card card-interactive flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
      <div>
        <p className="font-heading font-semibold text-foreground">{entry.title}</p>
        <p className="text-sm text-primary/85">
          {TYPE_LABELS[entry.type] ?? entry.type} · {timeStr} · {locationName}
          {entry.type === "mincha" && entry.useSeasonalMinchaOffset && " (התאמה עונתית)"}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="btn-secondary text-sm py-1.5 px-3"
        >
          עריכה
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? "…" : "מחיקה"}
        </button>
      </div>
    </li>
  );
}
