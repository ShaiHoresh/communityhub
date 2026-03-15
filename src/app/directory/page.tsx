import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import {
  getDirectoryEntries,
  getDirectoryTagLabel,
  getAvailableTags,
} from "@/lib/directory";

export const metadata = {
  title: "משפחות הקהילה | CommunityHub",
  description: "ספר טלפונים קהילתי עם סינון לפי תגיות",
};

type PageProps = { searchParams: Promise<{ tag?: string }> };

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterTag =
    params.tag && ["rabbi", "doctor", "volunteer", "other"].includes(params.tag)
      ? (params.tag as "rabbi" | "doctor" | "volunteer" | "other")
      : undefined;
  const entries = getDirectoryEntries(filterTag);
  const tags = getAvailableTags();

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="משפחות הקהילה"
        subtitle="ספר טלפונים קהילתי, סינון לפי תגיות (רב, רופא, מתנדב). פרטי התצוגה לפי הגדרות הפרטיות של כל משפחה."
      />
      <main className="mx-auto max-w-3xl px-6 py-10 text-right">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-primary/90 transition hover:text-primary hover:underline"
        >
          ← חזרה לדף הבית
        </Link>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/directory"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              !filterTag
                ? "bg-accent text-white shadow-sm hover:shadow"
                : "border border-secondary/40 bg-white text-primary hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            הכל
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/directory?tag=${tag}`}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                filterTag === tag
                  ? "bg-accent text-white shadow-sm"
                  : "border border-secondary/40 bg-white text-primary hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {getDirectoryTagLabel(tag)}
            </Link>
          ))}
        </div>

        {entries.length === 0 ? (
          <div className="surface-card card-interactive p-10 text-center">
            <p className="font-medium text-foreground">
              {filterTag
                ? `אין רשומות עם התגית "${getDirectoryTagLabel(filterTag)}".`
                : "אין עדיין רשומות במדריך. לאחר אישור בקשות גישה יופיעו כאן משפחות הקהילה."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.userId} className="surface-card card-interactive p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading font-semibold text-foreground">{entry.fullName}</p>
                    {entry.householdName && (
                      <p className="mt-0.5 text-sm text-primary/85">
                        {entry.householdName}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                        >
                          {getDirectoryTagLabel(t)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-primary/85">
                      {entry.phone != null && (
                        <a href={`tel:${entry.phone}`} className="hover:text-primary hover:underline">{entry.phone}</a>
                      )}
                      {entry.email != null && (
                        <a href={`mailto:${entry.email}`} className="hover:text-primary hover:underline">{entry.email}</a>
                      )}
                      {entry.phone == null && entry.email == null && (
                        <span className="text-primary/60">
                          פרטי התקשרות מוסתרים
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
