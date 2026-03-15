import {
  getAllToggles,
  getModuleLabel,
  type SeasonalModule,
} from "@/lib/system-toggles";
import { ToggleForm } from "./ToggleForm";

export const metadata = {
  title: "הגדרות מערכת | CommunityHub",
  description: "הפעלה/כיבוי מודולים עונתיים",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const toggles = getAllToggles();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">
        הגדרות מערכת
      </h1>
      <section className="surface-card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          מודולים עונתיים
        </h2>
        <p className="mb-6 text-sm text-primary/80">
          הפעל או כבה מודולים לפי עונה (ראש השנה, פורים).
        </p>
        <ToggleForm
          initialToggles={toggles}
          labels={{
            rosh_hashanah: getModuleLabel("rosh_hashanah"),
            purim: getModuleLabel("purim"),
          }}
        />
      </section>
    </div>
  );
}
