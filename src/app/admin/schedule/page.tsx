import { getLocations } from "@/lib/locations";

export const metadata = {
  title: "מנהל לוח זמנים | CommunityHub",
  description: "ניהול תפילות ושיעורים",
};

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const locations = getLocations();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        מנהל לוח זמנים
      </h1>
      <div className="surface-card card-interactive rounded-2xl p-10 text-center">
        <p className="font-medium text-foreground">טאב זה יאפשר CRUD לתפילות ולשיעורים (כולל לוגיקת מינחה שבת).</p>
        <p className="mt-2 text-sm text-primary/85">כרגע: {locations.length} מיקומים מוגדרים במערכת.</p>
      </div>
    </div>
  );
}
