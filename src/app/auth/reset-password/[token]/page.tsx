import Link from "next/link";
import { PageHeading } from "@/components/PageHeading";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { dbValidateResetToken } from "@/lib/db-password-reset";

type Props = { params: Promise<{ token: string }> };

export const metadata = {
  title: "איפוס סיסמה | CommunityHub",
  description: "הגדרת סיסמה חדשה",
};

export default async function ResetPasswordPage({ params }: Props) {
  const { token } = await params;

  // Pre-validate the token server-side so we can show a friendly error
  // before the user even fills in the form.
  const email = await dbValidateResetToken(token);

  if (!email) {
    return (
      <main id="main-content" className="mx-auto max-w-md px-6 py-12 text-right">
        <PageHeading
          title="קישור לא תקף"
          subtitle="הקישור פג תוקפו, כבר נוצל, או שגוי."
        />
        <div className="surface-card card-interactive rounded-2xl p-8 space-y-4">
          <p className="text-sm leading-relaxed text-foreground/80">
            קישורי איפוס סיסמה תקפים לשעה אחת בלבד ויכולים לשמש פעם אחת.
            בקש קישור חדש אם נדרש.
          </p>
          <Link href="/auth/forgot-password" className="btn-primary inline-flex">
            בקש קישור חדש
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto max-w-md px-6 py-12 text-right">
      <PageHeading
        title="איפוס סיסמה"
        subtitle={`מגדירים סיסמה חדשה עבור: ${email}`}
      />
      <div className="surface-card card-interactive rounded-2xl p-8">
        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
