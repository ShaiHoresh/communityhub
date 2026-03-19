"use server";

import { revalidatePath } from "next/cache";
import { createProject } from "@/lib/projects";
import { addTransaction } from "@/lib/transactions";
import { requireAdmin } from "@/lib/auth-guard";

export async function createProjectAction(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { success: false, error: "נא להזין שם פרויקט." };
  await createProject(name);
  revalidatePath("/admin/finance");
  return { success: true };
}

export async function addTransactionAction(formData: FormData) {
  await requireAdmin();
  const projectId = (formData.get("projectId") as string)?.trim();
  const type = formData.get("type") as "income" | "expense" | null;
  const amountStr = (formData.get("amount") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const dateStr = (formData.get("date") as string)?.trim();

  if (!projectId) return { success: false, error: "חסר פרויקט." };
  if (type !== "income" && type !== "expense") return { success: false, error: "נא לבחור הכנסה או הוצאה." };
  const amountCents = Math.round(parseFloat(amountStr || "0") * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) return { success: false, error: "נא להזין סכום תקין." };

  const date = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(date.getTime())) return { success: false, error: "תאריך לא תקין." };

  await addTransaction({
    projectId,
    type,
    amountCents,
    description,
    date,
  });
  revalidatePath("/admin/finance");
  return { success: true };
}
