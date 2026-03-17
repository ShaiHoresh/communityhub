import { getServerSession } from "next-auth";
import { BrandHeader } from "@/components/BrandHeader";
import { getLocations } from "@/lib/locations";
import { buildDailyScheduleForDate } from "@/lib/schedule";
import { getGmachItems } from "@/lib/gmach";
import { isModuleEnabled } from "@/lib/system-toggles";
import { authOptions } from "@/lib/auth-config";
import { HomeGuest } from "@/app/HomeGuest";
import { HomeMember } from "@/app/HomeMember";

function formatTime(d: Date) {
  return d.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type HomeProps = { searchParams: Promise<{ request?: string }> };

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const session = await getServerSession(authOptions);
  const status = session?.user ? (session.user as { status?: string }).status : null;
  const isMember = status === "MEMBER" || status === "ADMIN";

  const locations = getLocations();
  const mainLocation = locations[0];
  const today = new Date();
  const params = await searchParams;
  const showRequestSubmitted = params.request === "submitted";

  const schedule = await buildDailyScheduleForDate(today, mainLocation);
  const upcoming = schedule.events
    .filter((e) => e.start.getTime() >= Date.now())
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

  const gmachPreview = isMember ? getGmachItems().slice(0, 5) : [];
  const highHolidaysEnabled = isModuleEnabled("rosh_hashanah");
  const purimEnabled = isModuleEnabled("purim");

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="קהילת בית הכנסת / מרכז קהילתי"
        subtitle={
          isMember
            ? "לוח תפילות ושיעורים בזמן אמת, חיבור בין משפחות הקהילה, וריכוז תהליכים קהילתיים (חגים, תרומות ומיזמים) במקום אחד."
            : "ברוכים הבאים. צפו בתפילה הבאה והצטרפו לקהילה."
        }
      />
      <main className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-5xl flex-col gap-12 px-6 py-12 text-right sm:px-12">
        {showRequestSubmitted && (
          <div className="rounded-2xl border border-primary/25 bg-primary/10 px-5 py-4 text-sm font-medium text-primary shadow-sm">
            הבקשה נשלחה בהצלחה. הנהלת הקהילה תטפל בה בהקדם.
          </div>
        )}

        {isMember ? (
          <HomeMember
            schedule={schedule}
            upcoming={upcoming}
            formatTime={formatTime}
            gmachPreview={gmachPreview}
            isAdmin={status === "ADMIN"}
            highHolidaysEnabled={highHolidaysEnabled}
            purimEnabled={purimEnabled}
          />
        ) : (
          <HomeGuest
            upcoming={upcoming}
            formatTime={formatTime}
          />
        )}
      </main>
    </div>
  );
}
