import type { DirectoryTag } from "@/lib/households";
import { dbGetDirectoryEntries } from "@/lib/db-directory";

export type { DbDirectoryEntry as DirectoryEntry } from "@/lib/db-directory";
import type { DbDirectoryEntry as DirectoryEntry } from "@/lib/db-directory";

const TAG_LABELS: Record<DirectoryTag, string> = {
  rabbi: "רב",
  doctor: "רופא",
  volunteer: "מתנדב",
  other: "אחר",
};

export function getDirectoryTagLabel(tag: DirectoryTag): string {
  return TAG_LABELS[tag];
}

export async function getDirectoryEntries(filterTag?: DirectoryTag): Promise<DirectoryEntry[]> {
  return dbGetDirectoryEntries(filterTag);
}

export function getAvailableTags(): DirectoryTag[] {
  return ["rabbi", "doctor", "volunteer", "other"];
}
