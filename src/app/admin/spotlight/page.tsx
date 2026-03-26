import { dbGetAllSpotlights } from "@/lib/db-spotlight";
import { dbGetHouseholds } from "@/lib/db-households";
import { SpotlightForm } from "./SpotlightForm";
import { SpotlightRow } from "./SpotlightRow";

export const metadata = { title: "משפחת החודש | ניהול CommunityHub" };
export const dynamic = "force-dynamic";

export default async function AdminSpotlightPage() {
  const [spotlights, households] = await Promise.all([
    dbGetAllSpotlights(),
    dbGetHouseholds(),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          משפחת החודש
        </h1>
        <p className="mt-1 text-sm text-primary/75">
          רק משפחה אחת יכולה להיות פעילה בו-זמנית. לחצו "הפעל" כדי לשנות.
        </p>
      </div>

      <section className="surface-card rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">הוספת משפחה</h2>
        <SpotlightForm households={households.map((h) => ({ id: h.id, name: h.name }))} />
      </section>

      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          רשומות ({spotlights.length})
        </h2>
        {spotlights.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="font-medium text-foreground">אין רשומות עדיין.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {spotlights.map((item) => (
              <SpotlightRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
