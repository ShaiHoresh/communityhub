"use server";

import { setModuleEnabled, type SeasonalModule } from "@/lib/system-toggles";
import { requireAdmin } from "@/lib/auth-guard";
import {
  type ActionResult,
  revalidateAdminPaths,
  revalidateAppPaths,
} from "@/lib/action-utils";

export async function toggleModuleAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const modules = formData.getAll("module") as string[];
  const valid: SeasonalModule[] = ["rosh_hashanah", "purim"];

  for (const key of valid) {
    await setModuleEnabled(key, modules.includes(key));
  }
  revalidateAdminPaths();
  revalidateAppPaths();
  return { ok: true };
}
