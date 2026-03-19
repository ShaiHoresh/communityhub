import { isModuleEnabled } from "@/lib/system-toggles";
import { getHighHolidayRegistrations } from "@/lib/high-holidays";
import { submitHighHolidayRegistration } from "./actions";

export const metadata = {
  title: "רישום מקומות - ימים נוראים | CommunityHub",
  description: "רישום משפחתי למקומות בראש השנה ויום כיפור כולל התנדבות לוועדות והכנת בית הכנסת.",
};

export const dynamic = "force-dynamic";

export default async function HighHolidaysPage() {
  const enabled = await isModuleEnabled("rosh_hashanah");
  const registrations = await getHighHolidayRegistrations();

  if (!enabled) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <main id="main-content" className="mx-auto max-w-xl px-6 py-12 text-right">
          <div className="surface-card p-8 text-center">
            <p className="text-lg font-medium text-foreground">
              רישום לימים נוראים כרגע סגור.
            </p>
            <p className="mt-2 text-sm text-primary/80">
              כאשר ההרשמה תיפתח, יופיע כאן טופס הרישום למשפחה.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <main id="main-content" className="mx-auto max-w-2xl px-6 py-12 text-right">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            רישום מקומות לימים נוראים
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-primary/80">
            אנא בחרו מספר מקומות למשפחה, וסמנו אם תרצו להצטרף לוועדות השונות
            ולעזור בהכנת בית הכנסת בזמנים המוצעים.
          </p>
        </div>

        <form
          action={async (formData: FormData) => {
            "use server";
            await submitHighHolidayRegistration(formData);
          }}
          className="surface-card space-y-6 rounded-2xl p-6 sm:p-8"
        >
          <div>
            <label
              htmlFor="seats"
              className="mb-1 block text-sm font-semibold text-foreground"
            >
              מספר מקומות מבוקש
            </label>
            <input
              id="seats"
              name="seats"
              type="number"
              min={1}
              max={20}
              required
              defaultValue={2}
              className="w-full rounded-xl border border-secondary/30 bg-white px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-primary/70">
              ניתן לעדכן מול הנהלת הקהילה במקרה של שינויים.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-foreground">
              האם תרצו להצטרף לוועדות? (ניתן לבחור יותר מאחת)
            </legend>
            <label className="flex items-center gap-2 text-sm text-primary/90">
              <input
                type="checkbox"
                name="committees"
                value="events"
                className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
              />
              ועדת אירועים
            </label>
            <label className="flex items-center gap-2 text-sm text-primary/90">
              <input
                type="checkbox"
                name="committees"
                value="social"
                className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
              />
              ועדת קהילה וחברה
            </label>
            <label className="flex items-center gap-2 text-sm text-primary/90">
              <input
                type="checkbox"
                name="committees"
                value="learning"
                className="h-4 w-4 rounded border-secondary/50 text-primary focus:ring-primary"
              />
              ועדת שיעורים ותוכן
            </label>
          </fieldset>

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
                className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
              />
              ערב ראש השנה – סבב מוקדם
            </label>
            <label className="flex items-center gap-2 text-sm text-primary/90">
              <input
                type="radio"
                name="prepSlot"
                value="erev_rh_late"
                className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
              />
              ערב ראש השנה – סבב מאוחר
            </label>
            <label className="flex items-center gap-2 text-sm text-primary/90">
              <input
                type="radio"
                name="prepSlot"
                value="erev_yk_setup"
                className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
              />
              ערב יום כיפור – הכנה וסידור
            </label>
            <label className="flex items-center gap-2 text-sm text-primary/90">
              <input
                type="radio"
                name="prepSlot"
                value=""
                className="h-4 w-4 border-secondary/50 text-primary focus:ring-primary"
              />
              איננו זמינים למשמרות הכנה
            </label>
          </fieldset>

          <button type="submit" className="btn-primary">
            שליחת רישום
          </button>
        </form>

        {registrations.length > 0 && (
          <section className="mt-8 text-xs text-primary/60">
            <p>
              סיכום טכני (נראה רק בסביבת פיתוח): {registrations.length} רישומים
              נשמרו.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

