/**
 * In-memory feature toggles for seasonal modules (Phase 4b).
 * Used by Admin Overview KPIs and System Toggles settings page.
 */

export type SeasonalModule = "rosh_hashanah" | "purim";

const toggles: Record<SeasonalModule, boolean> = {
  rosh_hashanah: false,
  purim: false,
};

export function isModuleEnabled(module: SeasonalModule): boolean {
  return toggles[module];
}

export function setModuleEnabled(module: SeasonalModule, enabled: boolean): void {
  toggles[module] = enabled;
}

export function getAllToggles(): Record<SeasonalModule, boolean> {
  return { ...toggles };
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
