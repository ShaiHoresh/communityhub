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

  return (
    <div className="min-h-screen bg-background font-sans">
      <BrandHeader
        title="לוח גמ״ח"
        subtitle="פריטים לפי קטגוריות. פריטים מסומני עדיפות ועדה מופיעים בראש הרשימה."
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
            href="/gmach"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !categoryId
                ? "bg-accent text-white"
                : "border border-secondary/50 bg-secondary/10 text-primary hover:bg-secondary/20"
            }`}
          >
            הכל
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/gmach?category=${cat.id}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                categoryId === cat.id
                  ? "bg-accent text-white border-accent"
                  : `${cat.color} hover:opacity-90`
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="text-foreground">
              {categoryId
                ? "אין פריטים בקטגוריה זו."
                : "אין עדיין פריטים בלוח הגמ״ח."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const category = getGmachCategoryById(item.categoryId);
              return (
                <li
                  key={item.id}
                  className={`surface-card overflow-hidden p-4 ${
                    item.isPinnedByCommittee ? "border-accent/50 ring-1 ring-accent/30" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <GmachPinButton itemId={item.id} isPinned={item.isPinnedByCommittee} />
                        {item.isPinnedByCommittee && (
                          <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                            עדיפות ועדה
                          </span>
                        )}
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${
                            category?.color ?? "bg-secondary/20 text-primary"
                          }`}
                        >
                          {category?.label ?? item.categoryId}
                        </span>
                      </div>
                      <p className="mt-2 font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-sm text-primary/80">
                          {item.description}
                        </p>
                      )}
                      {item.contactInfo && (
                        <p className="mt-2 text-xs text-primary/70">
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

        <section className="surface-card mt-8 p-6">
          <GmachAddForm categories={categories} />
        </section>
      </main>
    </div>
  );
}
