import Link from "next/link";

const navGroups = [
  {
    label: "ניהול כללי",
    items: [
      { href: "/admin", label: "סקירה" },
      { href: "/admin/access-requests", label: "תור משתמשים" },
      { href: "/admin/schedule", label: "מנהל לוח זמנים" },
      { href: "/admin/locations", label: "מיקומים" },
      { href: "/admin/finance", label: "מרכז כספים" },
    ],
  },
  {
    label: "עונות",
    items: [
      { href: "/admin/high-holidays", label: "ימים נוראים" },
      { href: "/admin/purim-report", label: "דוח פורים" },
    ],
  },
  {
    label: "ניהול תוכן",
    items: [
      { href: "/admin/announcements", label: "מודעות" },
      { href: "/admin/mazal-tov", label: "מזל טוב" },
      { href: "/admin/dvar-torah", label: "דבר תורה" },
      { href: "/admin/spotlight", label: "משפחת החודש" },
      { href: "/admin/contact", label: "צור קשר" },
    ],
  },
  {
    label: "מערכת",
    items: [{ href: "/admin/settings", label: "הגדרות" }],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-6 py-6 text-right">
      <aside className="w-52 shrink-0">
        <nav
          className="surface-card sticky top-24 rounded-2xl p-4"
          aria-label="ניווט מנהל"
        >
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/"
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-primary/90 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              >
                ← דף הבית
              </Link>
            </li>
          </ul>
          {navGroups.map((group) => (
            <div key={group.label} className="mt-4">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-primary/50">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
