import type { PostgrestSingleResponse, PostgrestResponse } from "@supabase/supabase-js";

export function unwrap<T>(result: PostgrestSingleResponse<T>): T {
  if (result.error) throw result.error;
  return result.data;
}

export function unwrapList<T>(result: PostgrestResponse<T>): T[] {
  if (result.error) throw result.error;
  return result.data ?? [];
}

export function unwrapMaybe<T>(result: PostgrestSingleResponse<T | null>): T | null {
  if (result.error) throw result.error;
  return result.data ?? null;
}

export function unwrapCount(result: { count: number | null; error: any }): number {
  if (result.error) throw result.error;
  return result.count ?? 0;
}
