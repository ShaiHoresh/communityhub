import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isModuleEnabled } from "@/lib/system-toggles";
import { getRegistrationForHousehold } from "@/lib/high-holidays";
import { dbGetHhPrayers } from "@/lib/db-hh-prayers";
import { dbGetUserHouseholdId } from "@/lib/db-users";
import { HighHolidaysForm } from "./HighHolidaysForm";

export const metadata = {
  title: "רישום מקומות - ימים נוראים | CommunityHub",
  description: "רישום משפחתי למקומות בראש השנה ויום כיפור כולל התנדבות לוועדות והכנת בית הכנסת.",
};

export const dynamic = "force-dynamic";

export default async function HighHolidaysPage() {
  const session = await getServerSession(authOptions);
  const enabled = await isModuleEnabled("rosh_hashanah");
  const userId = (session?.user as { userId?: string })?.userId;

  if (!enabled) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <main id="main-content" className="mx-auto max-w-xl px-6 py-12 text-right">
          <Link
            href="/"
            className="mb-8 inline-block text-sm font-medium text-primary/90 transition hover:text-primary hover:underline"
          >
            ← חזרה לדף הבית
          </Link>
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

  const householdId = userId ? await dbGetUserHouseholdId(userId) : null;
  const [prayers, existingReg] = await Promise.all([
    dbGetHhPrayers(),
    householdId ? getRegistrationForHousehold(householdId) : Promise.resolve(null),
  ]);

  const serializedPrev = existingReg
    ? {
        seats: existingReg.seats,
        committeeInterest: existingReg.committeeInterest,
        prepSlot: existingReg.prepSlot,
        createdAt: existingReg.createdAt.toLocaleString("he-IL"),
      }
    : null;

  return (
    <div className="min-h-screen bg-background font-sans">
      <main id="main-content" className="mx-auto max-w-2xl px-6 py-12 text-right">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-primary/90 transition hover:text-primary hover:underline"
        >
          ← חזרה לדף הבית
        </Link>
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            רישום מקומות לימים נוראים
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-primary/80">
            מלאו מספר מקומות לכל תפילה (עזרת גברים / עזרת נשים), סמנו ועדות
            והצטרפות למשמרות הכנת בית הכנסת.
          </p>
        </div>

        <HighHolidaysForm
          prayers={prayers.map((p) => ({ id: p.id, name: p.name }))}
          previousReg={serializedPrev}
        />
      </main>
    </div>
  );
}
