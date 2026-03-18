import { getLocations } from "@/lib/locations";
import { LocationForm } from "./LocationForm";
import { LocationRow } from "./LocationRow";

export const metadata = {
  title: "מיקומים | CommunityHub",
  description: "ניהול מיקומים וקיבולת",
};

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  const locations = await getLocations();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        מיקומים – קיבולת וסוג מרחב
      </h1>

      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          הוספת / עדכון מיקום
        </h2>
        <LocationForm />
      </section>

      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          מיקומים קיימים
        </h2>
        {locations.length === 0 ? (
          <div className="surface-card card-interactive p-10 text-center">
            <p className="font-medium text-foreground">אין מיקומים.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {locations.map((loc) => (
              <LocationRow key={loc.id} location={loc} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

