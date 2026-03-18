import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { SignUpForm } from "./SignUpForm";

export const metadata = {
  title: "הרשמה | CommunityHub",
  description: "יצירת חשבון חדש",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="הרשמה"
        subtitle="אחרי ההרשמה חשבונך יועבר לאישור הנהלת הקהילה. לאחר האישור תוכל לגשת לכל האזור האישי."
      />
      <main id="main-content" className="mx-auto max-w-md px-6 py-12 text-right">
        <div className="surface-card card-interactive rounded-2xl p-8">
          <SignUpForm />
        </div>
        <p className="mt-8 text-center text-sm leading-relaxed text-primary/85">
          כבר יש לך חשבון?{" "}
          <Link href="/auth/signin" className="font-semibold text-primary underline transition hover:text-primary/80">
            התחברות
          </Link>
        </p>
      </main>
    </div>
  );
}
