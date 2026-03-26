import { dbGetAllDvarTorah } from "@/lib/db-dvar-torah";
import { DvarTorahForm } from "./DvarTorahForm";
import { DvarTorahRow } from "./DvarTorahRow";

export const metadata = { title: "דבר תורה | ניהול CommunityHub" };
export const dynamic = "force-dynamic";

export default async function AdminDvarTorahPage() {
  const entries = await dbGetAllDvarTorah();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        דבר תורה שבועי
      </h1>

      <section className="surface-card rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">פרסום דבר תורה חדש</h2>
        <DvarTorahForm />
      </section>

      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          ארכיון ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="font-medium text-foreground">לא פורסמו דברי תורה עדיין.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {entries.map((item) => (
              <DvarTorahRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
