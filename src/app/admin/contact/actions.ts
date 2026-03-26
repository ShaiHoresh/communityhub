"use server";

import { requireAdmin } from "@/lib/auth-guard";
import {
  dbMarkContactMessageRead,
  dbDeleteContactMessage,
} from "@/lib/db-contact";
import {
  type ActionResult,
  revalidateAdminPaths,
  safeAction,
} from "@/lib/action-utils";

export async function markReadAction(id: string, isRead: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbMarkContactMessageRead(id, isRead);
    revalidateAdminPaths();
    return { ok: true };
  });
}

export async function deleteContactMessageAction(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbDeleteContactMessage(id);
    revalidateAdminPaths();
    return { ok: true };
  });
}
