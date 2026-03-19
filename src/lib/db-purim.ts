import { supabaseAdmin } from "@/lib/supabase-admin";

export type PurimTier = "full" | "twenty" | "five";

export type DbPurimSelection = {
  householdId: string;
  tier: PurimTier;
  recipientHouseholdIds: string[];
  createdAt: Date;
};

export async function dbGetPurimSelectionForHousehold(householdId: string): Promise<DbPurimSelection | null> {
  const sb = supabaseAdmin();

  const { data: sel, error: selErr } = await sb
    .from("purim_selections")
    .select("id, household_id, tier, created_at")
    .eq("household_id", householdId)
    .maybeSingle();
  if (selErr) throw selErr;
  if (!sel) return null;

  const { data: recs, error: recErr } = await sb
    .from("purim_selection_recipients")
    .select("household_id")
    .eq("selection_id", (sel as any).id);
  if (recErr) throw recErr;

  return {
    householdId: (sel as any).household_id,
    tier: (sel as any).tier,
    recipientHouseholdIds: (recs ?? []).map((r: any) => r.household_id),
    createdAt: new Date((sel as any).created_at),
  };
}

export async function dbGetPurimSelections(): Promise<DbPurimSelection[]> {
  const sb = supabaseAdmin();
  const { data: sels, error: selErr } = await sb
    .from("purim_selections")
    .select("id, household_id, tier, created_at")
    .order("created_at", { ascending: false });
  if (selErr) throw selErr;

  const selectionIds = (sels ?? []).map((s: any) => s.id);
  const recipientsBySel: Record<string, string[]> = {};

  if (selectionIds.length > 0) {
    const { data: recs, error: recErr } = await sb
      .from("purim_selection_recipients")
      .select("selection_id, household_id")
      .in("selection_id", selectionIds);
    if (recErr) throw recErr;
    for (const r of recs ?? []) {
      const sid = (r as any).selection_id;
      if (!recipientsBySel[sid]) recipientsBySel[sid] = [];
      recipientsBySel[sid].push((r as any).household_id);
    }
  }

  return (sels ?? []).map((s: any) => ({
    householdId: s.household_id,
    tier: s.tier,
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

  const { data: sel, error: upsertErr } = await sb
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
    .single();
  if (upsertErr) throw upsertErr;

  const selectionId = (sel as any).id as string;

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
