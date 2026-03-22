import { revalidatePath } from "next/cache";

export type ActionResult = { ok: boolean; error?: string };

export function parseFormString(formData: FormData, key: string): string {
  return ((formData.get(key) as string) ?? "").trim();
}

export function parseFormInt(
  formData: FormData,
  key: string,
  fallback = 0,
): number {
  const raw = formData.get(key) as string | null;
  const n = parseInt(raw ?? "", 10);
  return isNaN(n) ? fallback : n;
}

export function revalidateAdminPaths() {
  for (const p of [
    "/admin",
    "/admin/schedule",
    "/admin/locations",
    "/admin/finance",
    "/admin/access-requests",
    "/admin/settings",
    "/admin/high-holidays",
  ]) {
    revalidatePath(p);
  }
}

export function revalidateAppPaths() {
  for (const p of ["/", "/gmach", "/purim", "/high-holidays", "/life-events"]) {
    revalidatePath(p);
  }
}
