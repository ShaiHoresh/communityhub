import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList, unwrapMaybe } from "@/lib/supabase-helpers";

export type PurimTier = "full" | "twenty" | "five";

export type PurimSelectionRow = {
  id: string;
  household_id: string;
  tier: string;
  created_at: string;
};

export type PurimRecipientRow = {
  selection_id: string;
  household_id: string;
};

export type DbPurimSelection = {
  householdId: string;
  tier: PurimTier;
  recipientHouseholdIds: string[];
  createdAt: Date;
};

export async function dbGetPurimSelectionForHousehold(householdId: string): Promise<DbPurimSelection | null> {
  const sb = supabaseAdmin();

  const sel = unwrapMaybe<PurimSelectionRow>(
    await sb
      .from("purim_selections")
      .select("id, household_id, tier, created_at")
      .eq("household_id", householdId)
      .maybeSingle(),
  );
  if (!sel) return null;

  const recs = unwrapList<Pick<PurimRecipientRow, "household_id">>(
    await sb.from("purim_selection_recipients").select("household_id").eq("selection_id", sel.id),
  );

  return {
    householdId: sel.household_id,
    tier: sel.tier as PurimTier,
    recipientHouseholdIds: recs.map((r) => r.household_id),
    createdAt: new Date(sel.created_at),
  };
}

export async function dbGetPurimSelections(): Promise<DbPurimSelection[]> {
  const sb = supabaseAdmin();
  const sels = unwrapList<PurimSelectionRow>(
    await sb.from("purim_selections").select("id, household_id, tier, created_at").order("created_at", { ascending: false }),
  );

  const selectionIds = sels.map((s) => s.id);
  const recipientsBySel: Record<string, string[]> = {};

  if (selectionIds.length > 0) {
    const recs = unwrapList<PurimRecipientRow>(
      await sb.from("purim_selection_recipients").select("selection_id, household_id").in("selection_id", selectionIds),
    );
    for (const r of recs) {
      const sid = r.selection_id;
      if (!recipientsBySel[sid]) recipientsBySel[sid] = [];
      recipientsBySel[sid].push(r.household_id);
    }
  }

  return sels.map((s) => ({
    householdId: s.household_id,
    tier: s.tier as PurimTier,
    recipientHouseholdIds: recipientsBySel[s.id] ?? [],
    createdAt: new Date(s.created_at),
  }));
}

export async function dbUpsertPurimSelection(input: {
  householdId: string;
  tier: PurimTier;
  recipientHouseholdIds: string[];
}): Promise<void> {
  const sb = supabaseAdmin();

  const sel = unwrap<Pick<PurimSelectionRow, "id">>(
    await sb
      .from("purim_selections")
      .upsert(
        {
          household_id: input.householdId,
          tier: input.tier,
          created_at: new Date().toISOString(),
        },
        { onConflict: "household_id" },
      )
      .select("id")
      .single(),
  );

  const selectionId = sel.id;

  const { error: delErr } = await sb.from("purim_selection_recipients").delete().eq("selection_id", selectionId);
  if (delErr) throw delErr;

  if (input.tier === "full") return;
  if (input.recipientHouseholdIds.length === 0) return;

  const { error: insErr } = await sb.from("purim_selection_recipients").insert(
    input.recipientHouseholdIds.map((hid) => ({
      selection_id: selectionId,
      household_id: hid,
    })),
  );
  if (insErr) throw insErr;
}

export async function dbGetPurimRecipientReport(): Promise<Record<string, DbPurimSelection[]>> {
  const selections = await dbGetPurimSelections();
  const result: Record<string, DbPurimSelection[]> = {};
  for (const sel of selections) {
    for (const hid of sel.recipientHouseholdIds) {
      if (!result[hid]) result[hid] = [];
      result[hid].push(sel);
    }
  }
  return result;
}
