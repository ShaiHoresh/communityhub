import type { HouseholdId, UserId } from "./households";
import { getHouseholds } from "./households";

export type PurimTier = "full" | "twenty" | "five";

export type PurimSelection = {
  userId: UserId;
  householdId?: HouseholdId;
  tier: PurimTier;
  recipientHouseholdIds: HouseholdId[]; // for 5 / 20 tiers
  createdAt: Date;
};

const selections: PurimSelection[] = [];

export function getPurimSelections(): PurimSelection[] {
  return [...selections];
}

export function getPurimSelectionForUser(userId: UserId): PurimSelection | undefined {
  return selections.find((s) => s.userId === userId);
}

export function upsertPurimSelection(
  data: Omit<PurimSelection, "createdAt">
): { ok: true } | { ok: false; error: string } {
  if (data.tier === "five" && data.recipientHouseholdIds.length > 5) {
    return { ok: false, error: "מותר לבחור עד 5 משפחות בלבד." };
  }
  if (data.tier === "twenty" && data.recipientHouseholdIds.length > 20) {
    return { ok: false, error: "מותר לבחור עד 20 משפחות בלבד." };
  }

  const idx = selections.findIndex((s) => s.userId === data.userId);
  const record: PurimSelection = {
    ...data,
    createdAt: new Date(),
  };

  if (idx === -1) {
    selections.push(record);
  } else {
    selections[idx] = record;
  }

  return { ok: true };
}

export function getPurimRecipientReport(): Record<HouseholdId, PurimSelection[]> {
  const households = getHouseholds();
  const result: Record<HouseholdId, PurimSelection[]> = {};
  for (const sel of selections) {
    for (const hid of sel.recipientHouseholdIds) {
      if (!result[hid]) result[hid] = [];
      result[hid].push(sel);
    }
  }
  // Ensure all households appear even if empty (optional)
  for (const h of households) {
    if (!result[h.id]) result[h.id] = [];
  }
  return result;
}

