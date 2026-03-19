import type { HouseholdId } from "./households";
import {
  dbGetPurimRecipientReport,
  dbGetPurimSelectionForHousehold,
  dbGetPurimSelections,
  dbUpsertPurimSelection,
  type PurimTier,
} from "@/lib/db-purim";

export type { PurimTier };

export type PurimSelection = {
  householdId: HouseholdId;
  tier: PurimTier;
  recipientHouseholdIds: HouseholdId[];
  createdAt: Date;
};

export async function getPurimSelections(): Promise<PurimSelection[]> {
  return dbGetPurimSelections();
}

export async function getPurimSelectionForHousehold(householdId: HouseholdId): Promise<PurimSelection | undefined> {
  const sel = await dbGetPurimSelectionForHousehold(householdId);
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
    householdId: data.householdId,
    tier: data.tier,
    recipientHouseholdIds: data.recipientHouseholdIds,
  });

  return { ok: true };
}

export async function getPurimRecipientReport(): Promise<Record<HouseholdId, PurimSelection[]>> {
  return dbGetPurimRecipientReport() as Promise<Record<HouseholdId, PurimSelection[]>>;
}
