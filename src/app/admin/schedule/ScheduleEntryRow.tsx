"use client";

import { useState } from "react";
import { updateEntryAction, deleteEntryAction } from "./actions";
import type { ScheduleEntry, ScheduleEntryType } from "@/lib/schedule-entries";
import type { Location } from "@/lib/locations";
import {
  DAY_TYPES,
  DAY_TYPE_LABELS,
  SEASONS,
  SEASON_LABELS,
  TIME_TYPES,
  TIME_TYPE_LABELS,
  ZMAN_KEYS,
  ZMAN_LABELS,
  type DayType,
  type TimeType,
} from "@/lib/zmanim";

const TYPE_LABELS: Record<string, string> = {
  shacharit: "שחרית",
  mincha: "מנחה",
  arvit: "ערבית",
  lesson: "שיעור",
};

const ENTRY_TYPES: { value: ScheduleEntryType; label: string }[] = [
  { value: "shacharit", label: "שחרית" },
  { value: "mincha", label: "מנחה" },
  { value: "arvit", label: "ערבית" },
  { value: "lesson", label: "שיעור" },
];

type Props = {
  entry: ScheduleEntry;
  locations: Location[];
};

function buildTimeSummary(entry: ScheduleEntry): string {
  if (entry.timeType === "FIXED") {
    const h = String(entry.fixedHour ?? 0).padStart(2, "0");
    const m = String(entry.fixedMinute ?? 0).padStart(2, "0");
    return `${h}:${m} (קבוע)`;
  }
  const zmanLabel = entry.zmanKey ? ZMAN_LABELS[entry.zmanKey] : "?";
  if (entry.timeType === "ZMANIM_BASED") {
    return zmanLabel;
  }
  const sign = entry.offsetMinutes >= 0 ? "+" : "";
  return `${zmanLabel} ${sign}${entry.offsetMinutes} דק׳`;
}

export function ScheduleEntryRow({ entry, locations }: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [timeType, setTimeType] = useState<TimeType>(entry.timeType);
  const [dayTypes, setDayTypes] = useState<DayType[]>(entry.dayTypes);

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

  function toggleDayType(dt: DayType) {
    setDayTypes((prev) =>
      prev.includes(dt) ? prev.filter((d) => d !== dt) : [...prev, dt],
    );
  }

  if (editing) {
    return (
      <li className="surface-card card-interactive rounded-2xl p-5">
        <form action={handleEdit} className="space-y-4">
          {/* Type + Title + Location */}
          <div className="grid gap-3 sm:grid-cols-3">
            <select name="type" defaultValue={entry.type} className="input-sm">
              {ENTRY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input name="title" defaultValue={entry.title} required className="input-sm" />
            <select name="locationId" defaultValue={entry.locationId} className="input-sm">
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Day types + Season */}
          <div className="grid gap-3 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-1 text-xs font-semibold text-foreground">ימים</legend>
              <div className="flex flex-wrap gap-2">
                {DAY_TYPES.map((dt) => (
                  <label key={dt} className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      name="dayTypes"
                      value={dt}
                      checked={dayTypes.includes(dt)}
                      onChange={() => toggleDayType(dt)}
                      className="h-3 w-3"
                    />
                    {DAY_TYPE_LABELS[dt]}
                  </label>
                ))}
              </div>
            </fieldset>
            <select name="season" defaultValue={entry.season} className="input-sm">
              {SEASONS.map((s) => (
                <option key={s} value={s}>{SEASON_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Specific date */}
          {dayTypes.includes("specific_date") && (
            <input
              name="specificDate"
              type="date"
              defaultValue={entry.specificDate ?? ""}
              className="input-sm max-w-xs"
            />
          )}

          {/* Time type + fields */}
          <div className="space-y-2">
            <select
              name="timeType"
              value={timeType}
              onChange={(e) => setTimeType(e.target.value as TimeType)}
              className="input-sm max-w-xs"
            >
              {TIME_TYPES.map((tt) => (
                <option key={tt} value={tt}>{TIME_TYPE_LABELS[tt]}</option>
              ))}
            </select>

            {timeType === "FIXED" && (
              <div className="flex gap-2">
                <input name="fixedHour" type="number" min={0} max={23} defaultValue={entry.fixedHour ?? 8} className="w-20 input-sm" />
                <span className="self-center text-primary/70">:</span>
                <input name="fixedMinute" type="number" min={0} max={59} defaultValue={entry.fixedMinute ?? 0} className="w-20 input-sm" />
              </div>
            )}

            {(timeType === "ZMANIM_BASED" || timeType === "DYNAMIC_OFFSET") && (
              <div className="flex gap-2">
                <select name="zmanKey" defaultValue={entry.zmanKey ?? ""} className="input-sm">
                  <option value="">-- זמן --</option>
                  {ZMAN_KEYS.map((z) => (
                    <option key={z} value={z}>{ZMAN_LABELS[z]}</option>
                  ))}
                </select>
                {timeType === "DYNAMIC_OFFSET" && (
                  <input
                    name="offsetMinutes"
                    type="number"
                    defaultValue={entry.offsetMinutes}
                    placeholder="דק׳"
                    className="w-24 input-sm"
                  />
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-primary/70">עיגול:</label>
              <input
                name="roundTo"
                type="number"
                min={0}
                max={30}
                defaultValue={entry.roundTo}
                className="w-16 input-sm"
              />
              <span className="text-xs text-primary/50">דק׳</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm py-1.5 px-3">שמירה</button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5 px-3">
              ביטול
            </button>
          </div>
        </form>
      </li>
    );
  }

  const locationName =
    locations.find((l) => l.id === entry.locationId)?.name ?? entry.locationId;
  const timeSummary = buildTimeSummary(entry);
  const dayLabels = entry.dayTypes.map((dt) => DAY_TYPE_LABELS[dt]).join(", ");
  const seasonLabel = entry.season !== "always" ? SEASON_LABELS[entry.season] : null;

  return (
    <li className="surface-card card-interactive flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
      <div className="space-y-1">
        <p className="font-heading font-semibold text-foreground">{entry.title}</p>
        <p className="text-sm text-primary/85">
          {TYPE_LABELS[entry.type] ?? entry.type} · {timeSummary} · {locationName}
          {entry.roundTo > 0 && ` (עיגול ל-${entry.roundTo} דק׳)`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {entry.dayTypes.map((dt) => (
            <span
              key={dt}
              className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary"
            >
              {DAY_TYPE_LABELS[dt]}
            </span>
          ))}
          {seasonLabel && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {seasonLabel}
            </span>
          )}
        </div>
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
          className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 disabled:opacity-50"
        >
          {deleting ? "…" : "מחיקה"}
        </button>
      </div>
    </li>
  );
}
