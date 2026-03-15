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
      <main className="mx-auto max-w-sm px-6 py-10 text-right">
        <SignUpForm />
        <p className="mt-6 text-center text-sm text-primary/80">
          כבר יש לך חשבון?{" "}
          <Link href="/auth/signin" className="font-medium text-primary underline">
            התחברות
          </Link>
        </p>
      </main>
    </div>
  );
}
