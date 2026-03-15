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
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← חזרה לדף הבית
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/directory"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !filterTag
                ? "bg-accent text-white"
                : "border border-secondary/50 bg-secondary/10 text-primary hover:bg-secondary/20"
            }`}
          >
            הכל
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/directory?tag=${tag}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filterTag === tag
                  ? "bg-accent text-white"
                  : "border border-secondary/50 bg-secondary/10 text-primary hover:bg-secondary/20"
              }`}
            >
              {getDirectoryTagLabel(tag)}
            </Link>
          ))}
        </div>

        {entries.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="text-foreground">
              {filterTag
                ? `אין רשומות עם התגית "${getDirectoryTagLabel(filterTag)}".`
                : "אין עדיין רשומות במדריך. לאחר אישור בקשות גישה יופיעו כאן משפחות הקהילה."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.userId} className="surface-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{entry.fullName}</p>
                    {entry.householdName && (
                      <p className="text-sm text-primary/80">
                        {entry.householdName}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {getDirectoryTagLabel(t)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-primary/80">
                      {entry.phone != null && (
                        <a href={`tel:${entry.phone}`}>{entry.phone}</a>
                      )}
                      {entry.email != null && (
                        <a href={`mailto:${entry.email}`}>{entry.email}</a>
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
