"use server";

import { requireAdmin } from "@/lib/auth-guard";
import { dbAddDvarTorah, dbDeleteDvarTorah } from "@/lib/db-dvar-torah";
import {
  type ActionResult,
  parseFormString,
  revalidateAdminPaths,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

export async function addDvarTorahAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const title = parseFormString(formData, "title");
    const author = parseFormString(formData, "author");
    const parasha = parseFormString(formData, "parasha");
    const date = parseFormString(formData, "date");
    const body = parseFormString(formData, "body");

    if (!title || !body || !date) return { ok: false, error: "כותרת, תוכן ותאריך הם שדות חובה." };

    await dbAddDvarTorah({
      title,
      author: author || "",
      parasha: parasha || "",
      date,
      body,
    });
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function deleteDvarTorahAction(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbDeleteDvarTorah(id);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}
