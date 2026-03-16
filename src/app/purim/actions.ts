"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { upsertPurimSelection, type PurimTier } from "@/lib/purim";
import { getUsers, getHouseholds } from "@/lib/households";
import { revalidatePath } from "next/cache";

export async function submitPurimSelection(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { userId?: string })?.userId;

  if (!session || !userId) {
    return { ok: false, error: "יש להתחבר כדי לבחור חבילה." };
  }

  const tier = formData.get("tier") as PurimTier | null;
  if (!tier) {
    return { ok: false, error: "נא לבחור חבילה (5, 20 או כל הקהילה)." };
  }

  const households = getHouseholds();
  const selectedRecipientIds = (formData.getAll("recipients") as string[]).filter(Boolean);
  const validRecipientIds = selectedRecipientIds.filter((id) =>
    households.some((h) => h.id === id)
  );

  const user = getUsers().find((u) => u.id === userId);

  const result = upsertPurimSelection({
    userId,
    householdId: user?.householdId ?? undefined,
    tier,
    recipientHouseholdIds: tier === "full" ? [] : validRecipientIds,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/purim");
  return { ok: true };
}

