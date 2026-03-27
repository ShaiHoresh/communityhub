import { dbGetAllAnnouncements } from "@/lib/db-announcements";
import { AnnouncementForm } from "./AnnouncementForm";
import { AnnouncementRow } from "./AnnouncementRow";

export const metadata = { title: "מודעות | קהילת באורך" };
export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await dbGetAllAnnouncements();

  return (
    <div className="space-y-10">
      <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">מודעות קהילה</h1>

      <section className="surface-card rounded-2xl p-6 sm:p-8">
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">פרסום מודעה חדשה</h2>
        <AnnouncementForm />
      </section>

      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          מודעות פעילות ({announcements.length})
        </h2>
        {announcements.length === 0 ? (
          <div className="surface-card p-10 text-center">
            <p className="font-medium text-foreground">אין מודעות.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {announcements.map((item) => (
              <AnnouncementRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
