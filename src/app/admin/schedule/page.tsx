import { getLocations } from "@/lib/locations";

export const metadata = {
  title: "מנהל לוח זמנים | CommunityHub",
  description: "ניהול תפילות ושיעורים",
};

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const locations = getLocations();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">
        מנהל לוח זמנים
      </h1>
      <div className="surface-card p-8 text-center text-primary/80">
        <p className="mb-2">טאב זה יאפשר CRUD לתפילות ולשיעורים (כולל לוגיקת מינחה שבת).</p>
        <p className="text-sm">כרגע: {locations.length} מיקומים מוגדרים במערכת.</p>
      </div>
    </div>
  );
}
