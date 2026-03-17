export type { GmachCategory, GmachCategoryId } from "@/lib/gmach-categories";
export { getGmachCategories, getGmachCategoryById } from "@/lib/gmach-categories";

export type GmachItemId = string;

export type GmachItem = {
  id: GmachItemId;
  categoryId: import("@/lib/gmach-categories").GmachCategoryId;
  title: string;
  description?: string;
  contactInfo?: string;
  isPinnedByCommittee: boolean;
  createdAt: Date;
};
import { dbAddGmachPost, dbGetGmachPosts, dbToggleGmachPinned } from "@/lib/db-gmach";

export async function getGmachItems(categoryId?: import("@/lib/gmach-categories").GmachCategoryId): Promise<GmachItem[]> {
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
