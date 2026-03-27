import { dbGetAllMazalTov } from "@/lib/db-mazal-tov";
import { MazalTovForm } from "./MazalTovForm";
import { MazalTovRow } from "./MazalTovRow";

export const metadata = { title: "מזל טוב | קהילת באורך" };
export const dynamic = "force-dynamic";

export default async function AdminMazalTovPage() {
  const entries = await dbGetAllMazalTov();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
        לוח מזל טוב
      </h1>

      <section className="surface-card rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">הוספת רשומה</h2>
        <MazalTovForm />
      </section>

      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          רשומות ({entries.length})
        </h2>
        {entries.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="font-medium text-foreground">אין רשומות עדיין.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {entries.map((item) => (
              <MazalTovRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
