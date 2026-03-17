import type { DirectoryTag } from "@/lib/db-directory";
import { dbGetDirectoryEntries } from "@/lib/db-directory";

export type DirectoryEntry = {
  userId: string;
  fullName: string;
  householdName: string | null;
  phone: string | null;
  email: string | null;
  tags: DirectoryTag[];
};

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
