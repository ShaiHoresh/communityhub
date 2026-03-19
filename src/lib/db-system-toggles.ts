import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrapList, unwrapMaybe } from "@/lib/supabase-helpers";
import type { SeasonalModule } from "@/lib/system-toggles";

export type ToggleRow = { key: string; enabled: boolean };

const ALL_MODULES: SeasonalModule[] = ["rosh_hashanah", "purim"];

export async function dbGetAllToggles(): Promise<Record<SeasonalModule, boolean>> {
  const sb = supabaseAdmin();
  const data = unwrapList<ToggleRow>(await sb.from("system_toggles").select("key, enabled"));

  const base: Record<SeasonalModule, boolean> = {
    rosh_hashanah: false,
    purim: false,
  };
  for (const row of data) {
    const k = row.key;
    if (k === "rosh_hashanah" || k === "purim") base[k] = !!row.enabled;
  }
  return base;
}

export async function dbIsModuleEnabled(module: SeasonalModule): Promise<boolean> {
  const sb = supabaseAdmin();
  const data = unwrapMaybe<Pick<ToggleRow, "enabled">>(
    await sb.from("system_toggles").select("enabled").eq("key", module).maybeSingle(),
  );
  return !!data?.enabled;
}

export async function dbSetModuleEnabled(module: SeasonalModule, enabled: boolean): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("system_toggles").upsert(
    {
      key: module,
      enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) throw error;
}

export async function dbEnsureDefaultToggles(): Promise<void> {
  const sb = supabaseAdmin();
  // IMPORTANT: do not overwrite existing values.
  const existing = unwrapList<Pick<ToggleRow, "key">>(await sb.from("system_toggles").select("key"));
  const existingKeys = new Set(existing.map((r) => r.key));
  const missing = ALL_MODULES.filter((k) => !existingKeys.has(k));
  if (missing.length === 0) return;

  const { error: insErr } = await sb.from("system_toggles").insert(
    missing.map((key) => ({
      key,
      enabled: false,
      updated_at: new Date().toISOString(),
    })),
  );
  if (insErr) throw insErr;
}

