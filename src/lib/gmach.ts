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

const items: GmachItem[] = [];

export function getGmachCategories(): GmachCategory[] {
  return [...CATEGORIES];
}

export function getGmachCategoryById(id: GmachCategoryId): GmachCategory | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getGmachItems(categoryId?: GmachCategoryId): GmachItem[] {
  let list = [...items];
  if (categoryId) list = list.filter((i) => i.categoryId === categoryId);
  // Committee priority: pinned first, then by date
  list.sort((a, b) => {
    if (a.isPinnedByCommittee !== b.isPinnedByCommittee)
      return a.isPinnedByCommittee ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return list;
}

function nextItemId(): GmachItemId {
  return `gm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addGmachItem(
  data: Omit<GmachItem, "id" | "createdAt" | "isPinnedByCommittee"> & { isPinnedByCommittee?: boolean }
): GmachItem {
  const item: GmachItem = {
    ...data,
    id: nextItemId(),
    isPinnedByCommittee: data.isPinnedByCommittee ?? false,
    createdAt: new Date(),
  };
  items.push(item);
  return item;
}

export function setGmachItemPinned(id: GmachItemId, pinned: boolean): boolean {
  const item = items.find((i) => i.id === id);
  if (!item) return false;
  item.isPinnedByCommittee = pinned;
  return true;
}

export function removeGmachItem(id: GmachItemId): boolean {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  return true;
}
