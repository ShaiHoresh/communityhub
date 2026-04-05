import { PageHeading } from "@/components/PageHeading";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = {
  title: "שכחת סיסמה | CommunityHub",
  description: "איפוס סיסמה",
};

export default function ForgotPasswordPage() {
  return (
    <main id="main-content" className="mx-auto max-w-md px-6 py-12 text-right">
      <PageHeading
        title="שכחת סיסמה"
        subtitle="הזן את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה."
      />
      <div className="surface-card card-interactive rounded-2xl p-8">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
