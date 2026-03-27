import {
  getAllToggles,
  getModuleLabel,
  type SeasonalModule,
} from "@/lib/system-toggles";
import { ToggleForm } from "./ToggleForm";

export const metadata = {
  title: "הגדרות מערכת | ����� �����",
  description: "הפעלה/כיבוי מודולים עונתיים",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const toggles = await getAllToggles();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        הגדרות מערכת
      </h1>
      <section className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
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
