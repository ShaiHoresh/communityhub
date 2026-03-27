import { dbGetAllContactMessages } from "@/lib/db-contact";
import { ContactMessageRow } from "./ContactMessageRow";

export const metadata = { title: "צור קשר | קהילת באורך" };
export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const messages = await dbGetAllContactMessages();
  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            הודעות – צור קשר
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm font-medium text-primary">
              {unreadCount} הודעות שלא נקראו
            </p>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-medium text-foreground">אין הודעות עדיין.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <ContactMessageRow key={msg.id} msg={msg} />
          ))}
        </ul>
      )}
    </div>
  );
}
