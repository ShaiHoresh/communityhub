export type GmachCategoryId = string;

export type GmachCategory = {
  id: GmachCategoryId;
  label: string;
  color: string;
};

export const GMACH_CATEGORIES: GmachCategory[] = [
  { id: "baby", label: "תינוקות וילדים", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { id: "tools", label: "כלים ומכשירים", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "books", label: "ספרים ולימוד", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "furniture", label: "ריהוט", color: "bg-stone-100 text-stone-800 border-stone-200" },
  { id: "other", label: "אחר", color: "bg-secondary/20 text-primary border-secondary/40" },
];

export function getGmachCategories(): GmachCategory[] {
  return [...GMACH_CATEGORIES];
}

export function getGmachCategoryById(id: GmachCategoryId): GmachCategory | undefined {
  return GMACH_CATEGORIES.find((c) => c.id === id);
}

