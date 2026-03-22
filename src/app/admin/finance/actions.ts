"use server";

import { createProject } from "@/lib/projects";
import { addTransaction } from "@/lib/transactions";
import { requireAdmin } from "@/lib/auth-guard";
import {
  type ActionResult,
  parseFormString,
  parseFormInt,
  revalidateAdminPaths,
} from "@/lib/action-utils";

export async function createProjectAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const name = parseFormString(formData, "name");
  if (!name) return { ok: false, error: "נא להזין שם פרויקט." };
  await createProject(name);
  revalidateAdminPaths();
  return { ok: true };
}

export async function addTransactionAction(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const projectId = parseFormString(formData, "projectId");
  const type = parseFormString(formData, "type");
  const amountStr = parseFormString(formData, "amount");
  const description = parseFormString(formData, "description");
  const dateStr = parseFormString(formData, "date");

  if (!projectId) return { ok: false, error: "חסר פרויקט." };
  if (type !== "income" && type !== "expense")
    return { ok: false, error: "נא לבחור הכנסה או הוצאה." };
  const amountCents = Math.round(parseFloat(amountStr || "0") * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0)
    return { ok: false, error: "נא להזין סכום תקין." };

  const date = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(date.getTime()))
    return { ok: false, error: "תאריך לא תקין." };

  await addTransaction({
    projectId,
    type: type as "income" | "expense",
    amountCents,
    description,
    date,
  });
  revalidateAdminPaths();
  return { ok: true };
}
