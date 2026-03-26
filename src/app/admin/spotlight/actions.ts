"use server";

import { requireAdmin } from "@/lib/auth-guard";
import {
  dbAddSpotlight,
  dbSetActiveSpotlight,
  dbDeleteSpotlight,
} from "@/lib/db-spotlight";
import {
  type ActionResult,
  parseFormString,
  revalidateAdminPaths,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

export async function addSpotlightAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    const householdId = parseFormString(formData, "householdId");
    const bio = parseFormString(formData, "bio");
    const photoUrl = parseFormString(formData, "photoUrl");

    if (!householdId) return { ok: false, error: "יש לבחור משק בית." };
    if (!bio) return { ok: false, error: "תיאור הוא שדה חובה." };

    await dbAddSpotlight({ householdId, bio, photoUrl: photoUrl || undefined });
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function setActiveSpotlightAction(id: string | null): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbSetActiveSpotlight(id);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}

export async function deleteSpotlightAction(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await requireAdmin();
    await dbDeleteSpotlight(id);
    revalidateAdminPaths();
    revalidateAppPaths();
    return { ok: true };
  });
}
