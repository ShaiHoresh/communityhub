import { getServerSession } from "next-auth";
import { BackLink } from "@/components/BackLink";
import { authOptions } from "@/lib/auth-config";
import { isModuleEnabled } from "@/lib/system-toggles";
import { getPurimSelectionForHousehold, getPurimSelections } from "@/lib/purim";
import { dbGetHouseholds } from "@/lib/db-households";
import { dbGetUserHouseholdId } from "@/lib/db-users";
import { PurimForm } from "./PurimForm";

export const metadata = {
  title: "פורים – משלוח מנות | CommunityHub",
  description:
    "בחירת חבילת משלוחי מנות (כל הקהילה / 20 משפחות / 5 משפחות) עם ממשק צבעוני ושמח.",
};

export const dynamic = "force-dynamic";

export default async function PurimPage() {
  const session = await getServerSession(authOptions);
  const enabled = await isModuleEnabled("purim");
  const userId = (session?.user as { userId?: string })?.userId;

  if (!enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-fuchsia-50 to-amber-100 font-sans">
        <main id="main-content" className="mx-auto max-w-xl px-6 py-16 text-right">
          <BackLink />
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

  const householdId = userId ? await dbGetUserHouseholdId(userId) : null;
  const [previousSelection, households, allSelections] = await Promise.all([
    householdId ? getPurimSelectionForHousehold(householdId) : Promise.resolve(undefined),
    dbGetHouseholds(),
    getPurimSelections(),
  ]);
  const devSelectionsCount = allSelections.length;

  const serializedPrev = previousSelection
    ? {
        tier: previousSelection.tier,
        recipientHouseholdIds: previousSelection.recipientHouseholdIds,
        createdAt: previousSelection.createdAt.toLocaleString("he-IL"),
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-fuchsia-50 to-amber-100 font-sans">
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-12 text-right sm:py-16">
        <BackLink />
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

        <PurimForm households={households} previousSelection={serializedPrev} />

        {devSelectionsCount > 0 && (
          <section className="mt-4 text-[11px] text-primary/50">
            <p>נתון פיתוח: נשמרו {devSelectionsCount} בחירות פורים.</p>
          </section>
        )}
      </main>
    </div>
  );
}
