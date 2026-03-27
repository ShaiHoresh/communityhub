import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/PageHeading";
import { authOptions } from "@/lib/auth-config";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata = {
  title: "ממתין לאישור | ����� �����",
  description: "חשבונך ממתין לאישור הנהלת הקהילה",
};

export default async function PendingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  const status = (session.user as { status?: string }).status;
  if (status !== "PENDING") {
    redirect("/");
  }

  return (
    <main id="main-content" className="mx-auto max-w-xl px-6 py-10 text-right">
      <PageHeading
        title="ממתין לאישור"
        subtitle="חשבונך נוצר בהצלחה ומועבר לאישור הנהלת הקהילה. לאחר האישור תוכל לגשת למדריך הקהילה, לוח הגמ״ח ואירועי החיים."
      />
      <div className="surface-card card-interactive space-y-6 p-10 text-center sm:p-12">
        <p className="font-heading text-xl font-bold text-foreground">
          חשבונך ממתין לאישור מנהל
        </p>
        <p className="text-sm leading-relaxed text-primary/85">
          הנהלת הקהילה תבדוק את הבקשה בהקדם. עם האישור תקבל גישה מלאה לאזור
          האישי. במקרה של שאלות ניתן לפנות להנהלה.
        </p>
        <SignOutButton />
      </div>
    </main>
  );
}
