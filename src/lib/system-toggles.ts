/**
 * Supabase-backed feature toggles for seasonal modules (Phase 4b).
 * Used by Admin Overview KPIs and System Toggles settings page.
 */

export type SeasonalModule = "rosh_hashanah" | "purim";

import {
  dbEnsureDefaultToggles,
  dbGetAllToggles,
  dbIsModuleEnabled,
  dbSetModuleEnabled,
} from "@/lib/db-system-toggles";

export async function isModuleEnabled(module: SeasonalModule): Promise<boolean> {
  await dbEnsureDefaultToggles();
  return dbIsModuleEnabled(module);
}

export async function setModuleEnabled(module: SeasonalModule, enabled: boolean): Promise<void> {
  await dbEnsureDefaultToggles();
  await dbSetModuleEnabled(module, enabled);
}

export async function getAllToggles(): Promise<Record<SeasonalModule, boolean>> {
  await dbEnsureDefaultToggles();
  return dbGetAllToggles();
}

export function getModuleLabel(module: SeasonalModule): string {
  switch (module) {
    case "rosh_hashanah":
      return "ראש השנה";
    case "purim":
      return "פורים";
    default:
      return module;
  }
}
