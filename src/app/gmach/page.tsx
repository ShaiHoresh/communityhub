import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import {
  getGmachCategories,
  getGmachItems,
  getGmachCategoryById,
} from "@/lib/gmach";
import { GmachAddForm } from "./GmachAddForm";
import { GmachPinButton } from "./GmachPinButton";

export const metadata = {
  title: "גמ״ח | CommunityHub",
  description: "לוח גמ״ח לפי קטגוריות עם סימון עדיפות ועדה",
};

type PageProps = { searchParams: Promise<{ category?: string }> };

export default async function GmachPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryId = params.category ?? undefined;
  const categories = getGmachCategories();
  const items = getGmachItems(categoryId);

  const categoryCardStyles: Record<string, string> = {
    baby: "border-r-4 border-r-pink-400 bg-gradient-to-l from-pink-50/60 to-white",
    tools: "border-r-4 border-r-amber-400 bg-gradient-to-l from-amber-50/60 to-white",
    books: "border-r-4 border-r-blue-400 bg-gradient-to-l from-blue-50/60 to-white",
    furniture: "border-r-4 border-r-stone-400 bg-gradient-to-l from-stone-50/70 to-white",
    other: "border-r-4 border-r-primary bg-gradient-to-l from-primary/5 to-white",
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="לוח גמ״ח"
        subtitle="פריטים לפי קטגוריות. פריטים מסומני עדיפות ועדה מופיעים בראש הרשימה."
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
            href="/gmach"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              !categoryId
                ? "bg-accent text-white shadow-sm hover:shadow"
                : "border border-secondary/40 bg-white text-primary hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            הכל
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/gmach?category=${cat.id}`}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                categoryId === cat.id
                  ? "border-accent bg-accent text-white shadow-sm"
                  : `${cat.color} hover:opacity-90 hover:shadow-sm`
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="surface-card card-interactive p-10 text-center">
            <p className="font-medium text-foreground">
              {categoryId
                ? "אין פריטים בקטגוריה זו."
                : "אין עדיין פריטים בלוח הגמ״ח."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => {
              const category = getGmachCategoryById(item.categoryId);
              const cardStyle = categoryCardStyles[item.categoryId] ?? categoryCardStyles.other;
              return (
                <li
                  key={item.id}
                  className={`card-interactive surface-card overflow-hidden rounded-2xl p-5 transition-all ${
                    item.isPinnedByCommittee ? "ring-2 ring-accent/40 ring-offset-2" : ""
                  } ${cardStyle}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <GmachPinButton itemId={item.id} isPinned={item.isPinnedByCommittee} />
                        {item.isPinnedByCommittee && (
                          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
                            עדיפות ועדה
                          </span>
                        )}
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
                            category?.color ?? "bg-secondary/20 text-primary border-secondary/40"
                          }`}
                        >
                          {category?.label ?? item.categoryId}
                        </span>
                      </div>
                      <h3 className="font-heading font-semibold text-foreground">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-2 text-sm leading-relaxed text-primary/85">
                          {item.description}
                        </p>
                      )}
                      {item.contactInfo && (
                        <p className="mt-3 text-xs text-primary/75">
                          ליצירת קשר: {item.contactInfo}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <section className="surface-card card-interactive mt-10 p-6 sm:p-8">
          <GmachAddForm categories={categories} />
        </section>
      </main>
    </div>
  );
}
