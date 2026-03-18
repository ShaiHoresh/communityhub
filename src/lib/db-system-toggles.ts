import { supabaseAdmin } from "@/lib/supabase-admin";
import type { SeasonalModule } from "@/lib/system-toggles";

const ALL_MODULES: SeasonalModule[] = ["rosh_hashanah", "purim"];

export async function dbGetAllToggles(): Promise<Record<SeasonalModule, boolean>> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("system_toggles").select("key, enabled");
  if (error) throw error;

  const base: Record<SeasonalModule, boolean> = {
    rosh_hashanah: false,
    purim: false,
  };
  for (const row of data ?? []) {
    const k = (row as any).key as string;
    if (k === "rosh_hashanah" || k === "purim") base[k] = !!(row as any).enabled;
  }
  return base;
}

export async function dbIsModuleEnabled(module: SeasonalModule): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("system_toggles")
    .select("enabled")
    .eq("key", module)
    .maybeSingle();
  if (error) throw error;
  return !!(data as any)?.enabled;
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
  const { data: existing, error: readErr } = await sb.from("system_toggles").select("key");
  if (readErr) throw readErr;
  const existingKeys = new Set((existing ?? []).map((r: any) => r.key as string));
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

