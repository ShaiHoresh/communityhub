import Link from "next/link";
import { Suspense } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "התחברות | CommunityHub",
  description: "התחברות לחשבון",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="התחברות"
        subtitle="הזן אימייל וסיסמה כדי להיכנס לחשבון."
      />
      <main id="main-content" className="mx-auto max-w-md px-6 py-12 text-right">
        <div className="surface-card card-interactive rounded-2xl p-8">
          <Suspense fallback={<div className="text-center text-primary/80">טוען...</div>}>
            <SignInForm />
          </Suspense>
        </div>
        <p className="mt-8 text-center text-sm leading-relaxed text-primary/85">
          אין לך חשבון?{" "}
          <Link href="/auth/signup" className="font-semibold text-primary underline transition hover:text-primary/80">
            הרשמה
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-primary/85">
          <Link href="/auth/forgot-password" className="underline transition hover:text-primary">
            שכחת סיסמה?
          </Link>
        </p>
      </main>
    </div>
  );
}
