import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isModuleEnabled } from "@/lib/system-toggles";
import { getHouseholds } from "@/lib/households";
import { getPurimSelectionForUser, getPurimSelections } from "@/lib/purim";
import { submitPurimSelection } from "./actions";

export const metadata = {
  title: "פורים – משלוח מנות | CommunityHub",
  description:
    "בחירת חבילת משלוחי מנות (כל הקהילה / 20 משפחות / 5 משפחות) עם ממשק צבעוני ושמח.",
};

export const dynamic = "force-dynamic";

export default async function PurimPage() {
  const session = await getServerSession(authOptions);
  const enabled = isModuleEnabled("purim");
  const userId = (session?.user as { userId?: string })?.userId;

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-fuchsia-50 to-amber-100 font-sans">
        <main className="mx-auto max-w-xl px-6 py-16 text-right">
          <div className="surface-card card-interactive rounded-3xl p-10 text-center">
            <p className="mb-3 text-lg font-heading font-bold text-foreground">
              🎭 כדי לבחור חבילת פורים יש להתחבר.
            </p>
            <Link href="/auth/signin" className="btn-primary">
              מעבר למסך התחברות
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-fuchsia-50 to-amber-100 font-sans">
        <main className="mx-auto max-w-xl px-6 py-16 text-right">
          <div className="surface-card rounded-3xl p-10 text-center">
            <p className="text-lg font-heading font-bold text-foreground">
              🎉 מערכת משלוחי המנות כרגע סגורה.
            </p>
            <p className="mt-2 text-sm text-primary/80">
              כשפורים יתקרב והמודול ייפתח, תוכלו לבחור כאן את החבילה המתאימה
              למשפחה שלכם.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const previousSelection = userId ? getPurimSelectionForUser(userId) : undefined;
  const households = getHouseholds();
  const devSelectionsCount = getPurimSelections().length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-fuchsia-50 to-amber-100 font-sans">
      <main className="mx-auto max-w-3xl px-6 py-12 text-right sm:py-16">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-700">
            פורים שמח 🎭🎁
          </p>
          <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            בחירת חבילת משלוחי מנות
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-primary/80">
            בחרו חבילה שמתאימה למשפחה –{" "}
            <strong>כל הקהילה</strong>,{" "}
            <strong>20 משפחות</strong> או <strong>5 משפחות</strong> – ולאחר מכן
            סמנו למי תרצו לשלוח (בחבילות 5/20).
          </p>
        </header>

        <form
          action={async (formData: FormData) => {
            "use server";
            await submitPurimSelection(formData);
          }}
          className="space-y-8"
        >
          <section className="grid gap-4 sm:grid-cols-3">
            <label className="card-interactive surface-card flex cursor-pointer flex-col items-stretch rounded-3xl border-2 border-transparent p-5 text-center hover:border-fuchsia-400">
              <input
                type="radio"
                name="tier"
                value="full"
                defaultChecked={previousSelection?.tier === "full"}
                className="sr-only"
              />
              <span className="text-2xl">🌍</span>
              <span className="mt-2 font-heading text-base font-bold text-foreground">
                כל הקהילה
              </span>
              <span className="mt-1 text-xs text-primary/75">
                משלוח מנות לכל המשפחות הרשומות.
              </span>
            </label>

            <label className="card-interactive surface-card flex cursor-pointer flex-col items-stretch rounded-3xl border-2 border-transparent p-5 text-center hover:border-fuchsia-400">
              <input
                type="radio"
                name="tier"
                value="twenty"
                defaultChecked={previousSelection?.tier === "twenty"}
                className="sr-only"
              />
              <span className="text-2xl">🎉</span>
              <span className="mt-2 font-heading text-base font-bold text-foreground">
                20 משפחות
              </span>
              <span className="mt-1 text-xs text-primary/75">
                בחרו עד 20 משפחות מתוך רשימת הקהילה.
              </span>
            </label>

            <label className="card-interactive surface-card flex cursor-pointer flex-col items-stretch rounded-3xl border-2 border-transparent p-5 text-center hover:border-fuchsia-400">
              <input
                type="radio"
                name="tier"
                value="five"
                defaultChecked={
                  !previousSelection || previousSelection.tier === "five"
                }
                className="sr-only"
              />
              <span className="text-2xl">🥳</span>
              <span className="mt-2 font-heading text-base font-bold text-foreground">
                5 משפחות
              </span>
              <span className="mt-1 text-xs text-primary/75">
                בחירה ממוקדת עד 5 משפחות אהובות.
              </span>
            </label>
          </section>

          <section className="surface-card card-interactive rounded-3xl p-6 sm:p-8">
            <h2 className="mb-3 font-heading text-lg font-bold text-foreground">
              בחירת משפחות (לחבילות 5 / 20)
            </h2>
            <p className="mb-4 text-xs text-primary/80">
              כאשר נבחרת חבילת &quot;כל הקהילה&quot; אין צורך לסמן משפחות
              ספציפיות. לחבילות 5 / 20 ניתן לסמן עד 5 / 20 שמות (המערכת תבדוק
              זאת).
            </p>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1 text-sm">
              {households.length === 0 ? (
                <p className="text-primary/70">
                  עדיין אין משפחות רשומות במערכת.
                </p>
              ) : (
                households.map((h) => (
                  <label
                    key={h.id}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-fuchsia-50/80 px-3 py-2 text-primary/90 hover:bg-fuchsia-100"
                  >
                    <span className="font-medium">{h.name}</span>
                    <input
                      type="checkbox"
                      name="recipients"
                      value={h.id}
                      className="h-4 w-4 rounded border-fuchsia-400 text-fuchsia-600 focus:ring-fuchsia-500"
                    />
                  </label>
                ))
              )}
            </div>
          </section>

          <button type="submit" className="btn-primary">
            שמירת בחירת פורים
          </button>
        </form>

        {previousSelection && (
          <section className="mt-6 text-xs text-primary/70">
            <p>
              בחירה אחרונה עודכנה: {previousSelection.createdAt.toLocaleString?.("he-IL") ?? ""}
            </p>
          </section>
        )}

        {devSelectionsCount > 0 && (
          <section className="mt-4 text-[11px] text-primary/50">
            <p>נתון פיתוח: נשמרו {devSelectionsCount} בחירות פורים בזיכרון.</p>
          </section>
        )}
      </main>
    </div>
  );
}

