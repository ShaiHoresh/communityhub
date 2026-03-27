import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { PageHeading } from "@/components/PageHeading";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "צור קשר | ����� �����",
  description: "שלחו הודעה להנהלת הקהילה",
};

export default async function ContactPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { name?: string; email?: string } | undefined;

  return (
    <main id="main-content" className="mx-auto max-w-xl px-6 py-10 text-right">
      <PageHeading
        title="צור קשר"
        subtitle="שלחו הודעה להנהלת הקהילה. נחזור אליכם בהקדם האפשרי."
      />

      <div className="surface-card card-interactive rounded-2xl p-6 sm:p-8">
        <ContactForm
          defaultName={user?.name ?? undefined}
          defaultEmail={user?.email ?? undefined}
        />
      </div>
    </main>
  );
}
