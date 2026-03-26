"use server";

import { requireAdmin } from "@/lib/auth-guard";
import {
  dbAddAnnouncement,
  dbDeleteAnnouncement,
  dbToggleAnnouncementPin,
} from "@/lib/db-announcements";
import {
  type ActionResult,
  parseFormString,
  revalidateAdminPaths,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

export async function addAnnouncementAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const title = parseFormString(formData, "title");
    const body = parseFormString(formData, "body");
    const isPinned = formData.get("isPinned") === "on";
    const expiresAtRaw = parseFormString(formData, "expiresAt");

    if (!title || !body) return { ok: false, error: "כותרת ותוכן הם שדות חובה." };

    await dbAddAnnouncement({
      title,
      body,
      isPinned,
      expiresAt: expiresAtRaw || undefined,
    });
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbDeleteAnnouncement(id);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function togglePinAction(id: string, isPinned: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbToggleAnnouncementPin(id, isPinned);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}
