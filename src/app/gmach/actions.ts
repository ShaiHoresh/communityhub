"use server";

import { addGmachItem, toggleGmachItemPinned } from "@/lib/gmach";
import { dbEnsureGmachCategories } from "@/lib/db-gmach";
import { getGmachCategories } from "@/lib/gmach-categories";
import { requireAdmin, requireMember } from "@/lib/auth-guard";
import {
  type ActionResult,
  parseFormString,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

export async function addGmachItemAction(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireMember();

    const categoryId = parseFormString(formData, "categoryId");
    const title = parseFormString(formData, "title");
    const description = parseFormString(formData, "description");
    const contactInfo = parseFormString(formData, "contactInfo");

    if (!categoryId || !title) {
      return { ok: false, error: "נא לבחור קטגוריה ולהזין כותרת." };
    }

    await dbEnsureGmachCategories(getGmachCategories());

    await addGmachItem({
      categoryId,
      title,
      description: description || undefined,
      contactInfo: contactInfo || undefined,
    });
    revalidateAppPaths();
    return { ok: true };
  });
}

// Pin/unpin is a committee operation ("עדיפות ועדה") — admin only.
export async function toggleGmachPinAction(
  itemId: string,
): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await toggleGmachItemPinned(itemId);
    revalidateAppPaths();
    return { ok: true };
  });
}
