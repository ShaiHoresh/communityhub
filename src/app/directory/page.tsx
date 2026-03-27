import { PageHeading } from "@/components/PageHeading";
import { BackLink } from "@/components/BackLink";
import { FilterTabs } from "@/components/FilterTabs";
import {
  getDirectoryEntries,
  getDirectoryTagLabel,
  getAvailableTags,
} from "@/lib/directory";

export const metadata = {
  title: "דף קשר קהילתי | קהילת באורך",
  description: "ספר טלפונים קהילתי עם סינון לפי תגיות",
};

type PageProps = { searchParams: Promise<{ tag?: string }> };

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterTag =
    params.tag && ["rabbi", "doctor", "volunteer", "other"].includes(params.tag)
      ? (params.tag as "rabbi" | "doctor" | "volunteer" | "other")
      : undefined;
  const entries = await getDirectoryEntries(filterTag);
  const tags = getAvailableTags();

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-10 text-right">
      <BackLink />
      <PageHeading
        title="דף קשר קהילתי"
        subtitle="ספר טלפונים קהילתי, סינון לפי תגיות (רב, רופא, מתנדב). פרטי התצוגה לפי הגדרות הפרטיות של כל משפחה."
      />

      <FilterTabs
        tabs={[
          { href: "/directory", label: "הכל", active: !filterTag },
          ...tags.map((tag) => ({
            href: `/directory?tag=${tag}`,
            label: getDirectoryTagLabel(tag),
            active: filterTag === tag,
          })),
        ]}
      />

      {entries.length === 0 ? (
        <div className="surface-card card-interactive p-10 text-center">
          <p className="font-medium text-foreground">
            {filterTag
              ? `אין רשומות עם התגית "${getDirectoryTagLabel(filterTag)}".`
              : "אין עדיין רשומות במדריך. לאחר אישור בקשות גישה יופיעו כאן דף קשר קהילתי."}
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
  );
}
