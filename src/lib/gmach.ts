export type GmachCategoryId = string;

export type GmachCategory = {
  id: GmachCategoryId;
  label: string;
  color: string; // Tailwind class or hex for category-based color coding
};

export type GmachItemId = string;

export type GmachItem = {
  id: GmachItemId;
  categoryId: GmachCategoryId;
  title: string;
  description?: string;
  contactInfo?: string;
  isPinnedByCommittee: boolean;
  createdAt: Date;
};

const CATEGORIES: GmachCategory[] = [
  { id: "baby", label: "תינוקות וילדים", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { id: "tools", label: "כלים ומכשירים", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "books", label: "ספרים ולימוד", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "furniture", label: "ריהוט", color: "bg-stone-100 text-stone-800 border-stone-200" },
  { id: "other", label: "אחר", color: "bg-secondary/20 text-primary border-secondary/40" },
];
import { dbAddGmachPost, dbGetGmachPosts, dbToggleGmachPinned } from "@/lib/db-gmach";

export function getGmachCategories(): GmachCategory[] {
  return [...CATEGORIES];
}

export function getGmachCategoryById(id: GmachCategoryId): GmachCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export async function getGmachItems(categoryId?: GmachCategoryId): Promise<GmachItem[]> {
  return dbGetGmachPosts(categoryId);
}

export function addGmachItem(
  data: Omit<GmachItem, "id" | "createdAt" | "isPinnedByCommittee"> & { isPinnedByCommittee?: boolean }
): Promise<GmachItem> {
  // Pinned is an admin-only flag; default false on insert
  return dbAddGmachPost({
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    contactInfo: data.contactInfo,
  });
}

export async function toggleGmachItemPinned(id: GmachItemId): Promise<boolean> {
  await dbToggleGmachPinned(id);
  return true;
}
