import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";

const navItems = [
  { href: "/admin", label: "סקירה" },
  { href: "/admin/access-requests", label: "תור משתמשים" },
  { href: "/admin/schedule", label: "מנהל לוח זמנים" },
  { href: "/admin/finance", label: "מרכז כספים" },
  { href: "/admin/settings", label: "הגדרות מערכת" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="מנהל מערכת"
        subtitle="פאנל ניהול הקהילה"
        logoLinkToHome={true}
      />
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-6 text-right">
        <aside className="w-52 shrink-0">
          <nav
            className="surface-card sticky top-6 rounded-xl p-4"
            aria-label="ניווט מנהל"
          >
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-primary/90 hover:bg-primary/10 hover:text-primary"
                >
                  ← דף הבית
                </Link>
              </li>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/10 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
