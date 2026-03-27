import { getLocations } from "@/lib/locations";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { LocationForm } from "./LocationForm";
import { LocationRow } from "./LocationRow";

export const metadata = {
  title: "מיקומים | ����� �����",
  description: "ניהול מיקומים וקיבולת",
};

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  const locations = await getLocations();

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          מיקומים – קיבולת וסוג מרחב
        </h1>
        <ExportExcelButton
          filename={`admin-locations-${new Date().toISOString().slice(0, 10)}.xlsx`}
          sheetName="Locations"
          rows={locations.map((l) => ({
            מזהה: l.id,
            שם: l.name,
            קיבולת: l.maxCapacity,
            סוג: l.spaceCategory,
          }))}
          className="btn-secondary text-sm"
        />
      </div>

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

