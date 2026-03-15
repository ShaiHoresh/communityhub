import type { DirectoryTag } from "./households";
import { getHouseholdById, getUsers } from "./households";

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

export function getDirectoryEntries(filterTag?: DirectoryTag): DirectoryEntry[] {
  const users = getUsers();
  const entries: DirectoryEntry[] = users
    .filter((u) => u.householdId != null)
    .map((u) => {
      const household = u.householdId ? getHouseholdById(u.householdId) : null;
      return {
        userId: u.id,
        fullName: u.fullName,
        householdName: household?.name ?? null,
        phone: u.showPhoneInDirectory !== false && u.phone ? u.phone : null,
        email: u.showEmailInDirectory !== false && u.email ? u.email : null,
        tags: u.directoryTags ?? [],
      };
    });

  if (filterTag) {
    return entries.filter((e) => e.tags.includes(filterTag));
  }
  return entries;
}

export function getAvailableTags(): DirectoryTag[] {
  return ["rabbi", "doctor", "volunteer", "other"];
}
