"use server";

import { revalidatePath } from "next/cache";
import { addGmachItem, toggleGmachItemPinned } from "@/lib/gmach";

export async function addGmachItemAction(formData: FormData) {
  const categoryId = (formData.get("categoryId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const contactInfo = (formData.get("contactInfo") as string)?.trim();

  if (!categoryId || !title) {
    return { success: false, error: "נא לבחור קטגוריה ולהזין כותרת." };
  }

  await addGmachItem({
    categoryId,
    title,
    description: description || undefined,
    contactInfo: contactInfo || undefined,
  });
  revalidatePath("/gmach");
  revalidatePath("/");
  return { success: true };
}

export async function toggleGmachPinAction(itemId: string) {
  await toggleGmachItemPinned(itemId);
  revalidatePath("/gmach");
  revalidatePath("/");
  return { success: true };
}
