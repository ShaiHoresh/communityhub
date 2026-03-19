"use client";

import { useActionState } from "react";
import { submitHighHolidayRegistration } from "./actions";

type Prayer = { id: string; name: string };
type SeatAlloc = { prayerId: string; menSeats: number; womenSeats: number };
type PreviousReg = {
  seats: SeatAlloc[];
  committeeInterest: string;
  prepSlot: string | null;
  createdAt: string;
} | null;

type Props = {
  prayers: Prayer[];
  previousReg: PreviousReg;
};

export function HighHolidaysForm({ prayers, previousReg }: Props) {
  const [state, formAction] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, formData: FormData) => {
      return await submitHighHolidayRegistration(formData);
    },
    null,
  );

  const prevSeatMap = new Map(
    (previousReg?.seats ?? []).map((s) => [s.prayerId, s]),
  );

  const prevCommittees = previousReg?.committeeInterest ?? "";

  return (
    <>
      <form action={formAction} className="surface-card space-y-6 rounded-2xl p-6 sm:p-8">
        {/* Per-prayer seats table */}
        {prayers.length === 0 ? (
          <p className="text-sm text-primary/60">
            טרם הוגדרו תפילות במערכת. פנה למנהל הקהילה.
          </p>
        ) : (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              מספר מקומות לכל תפילה
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-secondary/20 bg-secondary/10">
                    <th className="p-2 font-semibold text-foreground">תפילה</th>
                    <th className="p-2 text-center font-semibold text-foreground">עזרת גברים</th>
                    <th className="p-2 text-center font-semibold text-foreground">עזרת נשים</th>
                  </tr>
                </thead>
                <tbody>
                  {prayers.map((p) => {
                    const prev = prevSeatMap.get(p.id);
                    return (
                      <tr key={p.id} className="border-b border-secondary/10">
                        <td className="p-2 font-medium text-foreground">{p.name}</td>
                        <td className="p-2 text-center">
                          <input
                            name={`men_${p.id}`}
                            type="number"
                            min={0}
                            max={50}
                            defaultValue={prev?.menSeats ?? 0}
                            className="w-16 rounded-lg border border-secondary/30 bg-white px-2 py-1 text-center text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            name={`women_${p.id}`}
                            type="number"
                            min={0}
                            max={50}
                            defaultValue={prev?.womenSeats ?? 0}
                            className="w-16 rounded-lg border border-secondary/30 bg-white px-2 py-1 text-center text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Committees */}
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-foreground">
            האם תרצו להצטרף לוועדות? (ניתן לבחור יותר מאחת)
          </legend>
          <label className="flex items-center gap-2 text-sm text-primary/90">
            <input
              type="checkbox"
              name="committees"
              value="events"
              defaultChecked={prevCommittees.includes("events")}
              className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
            />
            ועדת אירועים
          </label>
          <label className="flex items-center gap-2 text-sm text-primary/90">
            <input
              type="checkbox"
              name="committees"
              value="social"
              defaultChecked={prevCommittees.includes("social")}
              className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
            />
            ועדת קהילה וחברה
          </label>
          <label className="flex items-center gap-2 text-sm text-primary/90">
            <input
              type="checkbox"
              name="committees"
              value="learning"
              defaultChecked={prevCommittees.includes("learning")}
              className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
            />
            ועדת שיעורים ותוכן
          </label>
        </fieldset>

        {/* Prep slots */}
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-foreground">
            הרשמה להכנת בית הכנסת (בחירת משמרת אחת)
          </legend>
          <p className="mb-2 text-xs text-primary/70">
            בחירה במשמרת אחת בלבד. אם אינכם זמינים, השאירו ללא בחירה.
          </p>
          <label className="flex items-center gap-2 text-sm text-primary/90">
            <input
              type="radio"
              name="prepSlot"
              value="erev_rh_early"
              defaultChecked={previousReg?.prepSlot === "erev_rh_early"}
              className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
            />
            ערב ראש השנה – סבב מוקדם
          </label>
          <label className="flex items-center gap-2 text-sm text-primary/90">
            <input
              type="radio"
              name="prepSlot"
              value="erev_rh_late"
              defaultChecked={previousReg?.prepSlot === "erev_rh_late"}
              className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
            />
            ערב ראש השנה – סבב מאוחר
          </label>
          <label className="flex items-center gap-2 text-sm text-primary/90">
            <input
              type="radio"
              name="prepSlot"
              value="erev_yk_setup"
              defaultChecked={previousReg?.prepSlot === "erev_yk_setup"}
              className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
            />
            ערב יום כיפור – הכנה וסידור
          </label>
          <label className="flex items-center gap-2 text-sm text-primary/90">
            <input
              type="radio"
              name="prepSlot"
              value=""
              defaultChecked={!previousReg?.prepSlot}
              className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
            />
            איננו זמינים למשמרות הכנה
          </label>
        </fieldset>

        {/* Status messages */}
        <div aria-live="polite" aria-atomic="true">
          {state && !state.ok && state.error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {state.error}
            </p>
          )}
          {state?.ok && (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              הרישום נשמר בהצלחה.
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary">
          שליחת רישום
        </button>
      </form>

      {previousReg && (
        <section className="mt-6 text-xs text-primary/70">
          <p>רישום אחרון עודכן: {previousReg.createdAt}</p>
        </section>
      )}
    </>
  );
}
