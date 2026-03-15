import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { authOptions } from "@/lib/auth-config";
import { SignOutButton } from "./SignOutButton";

export const metadata = {
  title: "ממתין לאישור | CommunityHub",
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
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="ממתין לאישור"
        subtitle="חשבונך נוצר בהצלחה ומועבר לאישור הנהלת הקהילה. לאחר האישור תוכל לגשת למדריך הקהילה, לוח הגמ״ח ואירועי החיים."
      />
      <main className="mx-auto max-w-xl px-6 py-12 text-right">
        <div className="surface-card space-y-6 p-8 text-center">
          <p className="text-lg font-medium text-foreground">
            חשבונך ממתין לאישור מנהל.
          </p>
          <p className="text-sm text-primary/80">
            הנהלת הקהילה תבדוק את הבקשה בהקדם. עם האישור תקבל גישה מלאה לאזור
            האישי. במקרה של שאלות ניתן לפנות להנהלה.
          </p>
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
