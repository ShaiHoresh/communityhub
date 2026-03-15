"use server";

import { setModuleEnabled, type SeasonalModule } from "@/lib/system-toggles";
import { revalidatePath } from "next/cache";

export async function toggleModuleAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string } | null> {
  const modules = formData.getAll("module") as string[];
  const valid: SeasonalModule[] = ["rosh_hashanah", "purim"];
  for (const key of valid) {
    setModuleEnabled(key, modules.includes(key));
  }
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  return { success: true };
}
