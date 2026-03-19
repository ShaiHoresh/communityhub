"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { upsertPurimSelection, type PurimTier } from "@/lib/purim";
import { revalidatePath } from "next/cache";
import { dbGetHouseholds, dbIsHouseholdManager } from "@/lib/db-households";
import { dbGetUserHouseholdId } from "@/lib/db-users";

export async function submitPurimSelection(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { userId?: string })?.userId;

  if (!session || !userId) {
    return { ok: false, error: "יש להתחבר כדי לבחור חבילה." };
  }

  const householdId = await dbGetUserHouseholdId(userId);
  if (!householdId) {
    return { ok: false, error: "לא משויך למשק בית. פנה להנהלת הקהילה." };
  }

  const isManager = await dbIsHouseholdManager(householdId, userId);
  if (!isManager) {
    return { ok: false, error: "רק מנהל משק בית יכול לבחור חבילת פורים." };
  }

  const tier = formData.get("tier") as PurimTier | null;
  if (!tier) {
    return { ok: false, error: "נא לבחור חבילה (5, 20 או כל הקהילה)." };
  }

  const households = await dbGetHouseholds();
  const selectedRecipientIds = (formData.getAll("recipients") as string[]).filter(Boolean);
  const validRecipientIds = selectedRecipientIds.filter((id) =>
    households.some((h) => h.id === id)
  );

  const result = await upsertPurimSelection({
    householdId,
    tier,
    recipientHouseholdIds: tier === "full" ? [] : validRecipientIds,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/purim");
  return { ok: true };
}
