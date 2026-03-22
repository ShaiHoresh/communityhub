"use client";

import { useState } from "react";
import { useActionState } from "react";
import { addEntryAction } from "./actions";
import { FormError, FormSuccess } from "@/components/FormFeedback";
import type { ScheduleEntryType } from "@/lib/schedule-entries";
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

const ENTRY_TYPES: { value: ScheduleEntryType; label: string }[] = [
  { value: "shacharit", label: "שחרית" },
  { value: "mincha", label: "מנחה" },
  { value: "arvit", label: "ערבית" },
  { value: "lesson", label: "שיעור" },
];

type Props = { locations: Location[] };

export function ScheduleEntryForm({ locations }: Props) {
  const [timeType, setTimeType] = useState<TimeType>("FIXED");
  const [dayTypes, setDayTypes] = useState<DayType[]>(["weekday", "shabbat"]);

  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => addEntryAction(formData),
    null as { ok: boolean; error?: string } | null,
  );

  function toggleDayType(dt: DayType) {
    setDayTypes((prev) =>
      prev.includes(dt) ? prev.filter((d) => d !== dt) : [...prev, dt],
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Row 1: Type + Title + Location */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-semibold text-foreground">
            סוג
          </label>
          <select id="type" name="type" required className="input-base">
            {ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-semibold text-foreground">
            כותרת
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="למשל: שיעור גמרא"
            className="input-base"
          />
        </div>
        <div>
          <label htmlFor="locationId" className="mb-1 block text-sm font-semibold text-foreground">
            מיקום
          </label>
          <select id="locationId" name="locationId" required className="input-base">
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Day Types + Season */}
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-foreground">ימים</legend>
          <div className="flex flex-wrap gap-3">
            {DAY_TYPES.map((dt) => (
              <label key={dt} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="dayTypes"
                  value={dt}
                  checked={dayTypes.includes(dt)}
                  onChange={() => toggleDayType(dt)}
                  className="checkbox-base"
                />
                {DAY_TYPE_LABELS[dt]}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="season" className="mb-1 block text-sm font-semibold text-foreground">
            עונה
          </label>
          <select id="season" name="season" className="input-base">
            {SEASONS.map((s) => (
              <option key={s} value={s}>{SEASON_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Specific date (visible when specific_date is checked) */}
      {dayTypes.includes("specific_date") && (
        <div>
          <label htmlFor="specificDate" className="mb-1 block text-sm font-semibold text-foreground">
            תאריך מסוים
          </label>
          <input id="specificDate" name="specificDate" type="date" className="input-base max-w-xs" />
        </div>
      )}

      {/* Row 3: Time Type */}
      <div>
        <label htmlFor="timeType" className="mb-1 block text-sm font-semibold text-foreground">
          סוג חישוב שעה
        </label>
        <select
          id="timeType"
          name="timeType"
          className="input-base max-w-xs"
          value={timeType}
          onChange={(e) => setTimeType(e.target.value as TimeType)}
        >
          {TIME_TYPES.map((tt) => (
            <option key={tt} value={tt}>{TIME_TYPE_LABELS[tt]}</option>
          ))}
        </select>
      </div>

      {/* Conditional: FIXED → hour + minute */}
      {timeType === "FIXED" && (
        <div className="grid gap-4 sm:grid-cols-2 max-w-xs">
          <div>
            <label htmlFor="fixedHour" className="mb-1 block text-sm font-semibold text-foreground">שעה</label>
            <input id="fixedHour" name="fixedHour" type="number" min={0} max={23} defaultValue={8} className="input-base" />
          </div>
          <div>
            <label htmlFor="fixedMinute" className="mb-1 block text-sm font-semibold text-foreground">דקה</label>
            <input id="fixedMinute" name="fixedMinute" type="number" min={0} max={59} defaultValue={0} className="input-base" />
          </div>
        </div>
      )}

      {/* Conditional: ZMANIM_BASED → zman dropdown */}
      {timeType === "ZMANIM_BASED" && (
        <div className="max-w-xs">
          <label htmlFor="zmanKey" className="mb-1 block text-sm font-semibold text-foreground">זמן הלכתי</label>
          <select id="zmanKey" name="zmanKey" required className="input-base">
            <option value="">-- בחר זמן --</option>
            {ZMAN_KEYS.map((z) => (
              <option key={z} value={z}>{ZMAN_LABELS[z]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Conditional: DYNAMIC_OFFSET → zman + offset */}
      {timeType === "DYNAMIC_OFFSET" && (
        <div className="grid gap-4 sm:grid-cols-2 max-w-md">
          <div>
            <label htmlFor="zmanKey" className="mb-1 block text-sm font-semibold text-foreground">זמן הלכתי</label>
            <select id="zmanKey" name="zmanKey" required className="input-base">
              <option value="">-- בחר זמן --</option>
              {ZMAN_KEYS.map((z) => (
                <option key={z} value={z}>{ZMAN_LABELS[z]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="offsetMinutes" className="mb-1 block text-sm font-semibold text-foreground">
              הזזה (דקות)
            </label>
            <input
              id="offsetMinutes"
              name="offsetMinutes"
              type="number"
              defaultValue={0}
              placeholder="-20 = לפני, +10 = אחרי"
              className="input-base"
            />
          </div>
        </div>
      )}

      {/* Rounding */}
      <div className="max-w-xs">
        <label htmlFor="roundTo" className="mb-1 block text-sm font-semibold text-foreground">
          עיגול לדקות (0 = ללא)
        </label>
        <input id="roundTo" name="roundTo" type="number" min={0} max={30} defaultValue={0} className="input-base" />
      </div>

      <button type="submit" className="btn-primary">
        הוספת רשומה
      </button>
      <FormError message={state?.error} />
      {state?.ok && <FormSuccess message="נוסף בהצלחה." />}
    </form>
  );
}
