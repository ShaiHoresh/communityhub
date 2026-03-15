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
      <main className="mx-auto max-w-sm px-6 py-10 text-right">
        <Suspense fallback={<div className="text-center text-primary/80">טוען...</div>}>
          <SignInForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-primary/80">
          אין לך חשבון?{" "}
          <Link href="/auth/signup" className="font-medium text-primary underline">
            הרשמה
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-primary/80">
          <Link href="/auth/forgot-password" className="text-primary/80 underline">
            שכחת סיסמה?
          </Link>
        </p>
      </main>
    </div>
  );
}
