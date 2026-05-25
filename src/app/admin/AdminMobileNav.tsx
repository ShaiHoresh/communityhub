"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "סקירה" },
  { href: "/admin/access-requests", label: "תור משתמשים" },
  { href: "/admin/schedule", label: "לוח זמנים" },
  { href: "/admin/locations", label: "מיקומים" },
  { href: "/admin/finance", label: "מרכז כספים" },
  { href: "/admin/high-holidays", label: "ימים נוראים" },
  { href: "/admin/purim-report", label: "דוח פורים" },
  { href: "/admin/settings", label: "הגדרות" },
];

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-secondary/15 bg-background px-4 py-3 dark:border-slate-700/30">
        <span className="font-heading text-sm font-bold text-foreground">
          ניהול מערכת
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-mobile-menu"
          aria-label={open ? "סגור תפריט" : "פתח תפריט"}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition hover:bg-secondary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {open ? (
            /* Close icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Dropdown panel */}
      {open && (
        <nav
          id="admin-mobile-menu"
          aria-label="ניווט מנהל"
          className="border-b border-secondary/15 bg-background px-4 pb-4 pt-3 dark:border-slate-700/30"
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="mb-3 block rounded-xl px-3 py-2.5 text-sm font-semibold text-primary/90 transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            ← דף הבית
          </Link>
          <ul className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-3 py-2.5 text-center text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      isActive
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-secondary/10 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
