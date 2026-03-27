import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { dbGetUserById } from "@/lib/db-users";
import { PageHeading } from "@/components/PageHeading";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { BackLink } from "@/components/BackLink";

export const metadata = {
  title: "הפרופיל שלי | ����� �����",
  description: "ניהול פרטים אישיים והגדרות פרטיות",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { userId?: string })?.userId;
  if (!userId) redirect("/auth/signin");

  const user = await dbGetUserById(userId);
  if (!user) redirect("/auth/signin");

  const statusLabel: Record<string, string> = {
    MEMBER: "חבר קהילה",
    ADMIN: "מנהל",
    PENDING: "ממתין לאישור",
  };

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-6 py-10 text-right">
      <BackLink />
      <PageHeading
        title="הפרופיל שלי"
        subtitle="ניהול פרטים אישיים, פרטיות ואבטחה"
      />

      <div className="space-y-8">
        {/* Profile details */}
        <div className="surface-card rounded-2xl p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="font-heading text-lg font-bold text-foreground">פרטים אישיים</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {statusLabel[user.status] ?? user.status}
            </span>
          </div>
          <ProfileForm
            defaultFullName={user.fullName}
            defaultPhone={user.phone ?? ""}
            defaultShowPhone={user.showPhoneInDirectory}
            defaultShowEmail={user.showEmailInDirectory}
            email={user.email}
          />
        </div>

        {/* Change password */}
        <div className="surface-card rounded-2xl p-6 sm:p-8">
          <h2 className="mb-5 font-heading text-lg font-bold text-foreground">שינוי סיסמה</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
