import { getServerSession } from "next-auth";
import { getLocations } from "@/lib/locations";
import { buildDailyScheduleForDate } from "@/lib/schedule";
import { getGmachItems } from "@/lib/gmach";
import { isModuleEnabled } from "@/lib/system-toggles";
import { authOptions } from "@/lib/auth-config";
import { dbGetActiveAnnouncements } from "@/lib/db-announcements";
import { dbGetLatestDvarTorah } from "@/lib/db-dvar-torah";
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
  const [session, locations, params] = await Promise.all([
    getServerSession(authOptions),
    getLocations(),
    searchParams,
  ]);

  const status = session?.user ? (session.user as { status?: string }).status : null;
  const isMember = status === "MEMBER" || status === "ADMIN";
  const mainLocation = locations[0];
  const today = new Date();
  const showRequestSubmitted = params.request === "submitted";

  const [schedule, gmachPreview, highHolidaysEnabled, purimEnabled, announcements, dvarTorah] =
    await Promise.all([
      buildDailyScheduleForDate(today, mainLocation),
      isMember ? getGmachItems() : Promise.resolve([]),
      isModuleEnabled("rosh_hashanah"),
      isModuleEnabled("purim"),
      dbGetActiveAnnouncements().catch(() => []),
      dbGetLatestDvarTorah().catch(() => null),
    ]);

  const upcoming = schedule.events
    .filter((e) => e.start.getTime() >= Date.now())
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

  const gmachSlice = gmachPreview.slice(0, 5);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-5xl flex-col gap-10 px-6 py-10 text-right sm:px-12"
    >
      {/* Compact hero banner — ~200px, proportional to the page */}
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-l from-primary/8 via-background to-secondary/5 px-7 py-7 sm:px-10">
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          קהילת באורך - ירושלים
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary/80">
          {isMember
            ? "לוח תפילות ושיעורים בזמן אמת, חיבור בין משפחות הקהילה, וריכוז תהליכים קהילתיים (חגים, תרומות ומיזמים) במקום אחד."
            : "ברוכים הבאים. צפו בתפילה הבאה והצטרפו לקהילה."}
        </p>
      </div>

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
            gmachPreview={gmachSlice}
            isAdmin={status === "ADMIN"}
            highHolidaysEnabled={highHolidaysEnabled}
            purimEnabled={purimEnabled}
            dvarTorah={dvarTorah}
          />
        ) : (
          <HomeGuest
            upcoming={upcoming}
            formatTime={formatTime}
            announcements={announcements}
            dvarTorah={dvarTorah}
          />
        )}
    </main>
  );
}
