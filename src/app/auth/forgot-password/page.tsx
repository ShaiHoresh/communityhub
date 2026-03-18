import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";

export const metadata = {
  title: "שכחת סיסמה | CommunityHub",
  description: "איפוס סיסמה",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="שכחת סיסמה"
        subtitle="לאפס את הסיסמה יש לפנות להנהלת הקהילה או להשתמש בשירות איפוס (יופעל בהמשך)."
      />
      <main id="main-content" className="mx-auto max-w-xl px-6 py-12 text-right">
        <div className="surface-card card-interactive space-y-6 rounded-2xl p-8 sm:p-10">
          <p className="leading-relaxed text-foreground">
            כרגע איפוס סיסמה מתבצע דרך הנהלת הקהילה. פנה למנהל המערכת עם פרטי
            החשבון (אימייל) כדי לאפס את הסיסמה.
          </p>
          <p className="text-sm leading-relaxed text-primary/85">
            בעתיד יתווסף שליחת קישור איפוס לאימייל (Password Reset flow).
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/auth/signin" className="btn-primary">
              חזרה להתחברות
            </Link>
            <Link href="/" className="btn-secondary">
              דף הבית
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
