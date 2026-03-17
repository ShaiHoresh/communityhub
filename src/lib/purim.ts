import type { HouseholdId, UserId } from "./households";
import {
  dbGetPurimRecipientReport,
  dbGetPurimSelectionForUser,
  dbGetPurimSelections,
  dbUpsertPurimSelection,
  type PurimTier,
} from "@/lib/db-purim";

export type { PurimTier };

export type PurimSelection = {
  userId: UserId;
  householdId?: HouseholdId;
  tier: PurimTier;
  recipientHouseholdIds: HouseholdId[]; // for 5 / 20 tiers
  createdAt: Date;
};

export async function getPurimSelections(): Promise<PurimSelection[]> {
  return dbGetPurimSelections();
}

export async function getPurimSelectionForUser(userId: UserId): Promise<PurimSelection | undefined> {
  const sel = await dbGetPurimSelectionForUser(userId);
  return sel ?? undefined;
}

export async function upsertPurimSelection(
  data: Omit<PurimSelection, "createdAt">
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (data.tier === "five" && data.recipientHouseholdIds.length > 5) {
    return { ok: false, error: "מותר לבחור עד 5 משפחות בלבד." };
  }
  if (data.tier === "twenty" && data.recipientHouseholdIds.length > 20) {
    return { ok: false, error: "מותר לבחור עד 20 משפחות בלבד." };
  }

  await dbUpsertPurimSelection({
    userId: data.userId,
    tier: data.tier,
    recipientHouseholdIds: data.recipientHouseholdIds,
  });

  return { ok: true };
}

export async function getPurimRecipientReport(): Promise<Record<HouseholdId, PurimSelection[]>> {
  return dbGetPurimRecipientReport() as Promise<Record<HouseholdId, PurimSelection[]>>;
}

