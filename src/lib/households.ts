export type HouseholdId = string;
export type UserId = string;

export type Household = {
  id: HouseholdId;
  name: string;
  // Users who belong to this household (foreign key: User.householdId)
  memberIds: UserId[];
  // Managers are a subset of members, typically spouses.
  managerIds: UserId[];
};

/** Tags for directory (e.g. רב, רופא, מתנדב). */
export type DirectoryTag = "rabbi" | "doctor" | "volunteer" | "other";

/** Global account status: PENDING until Admin approves, then MEMBER or ADMIN. */
export type UserStatus = "PENDING" | "MEMBER" | "ADMIN";

export type User = {
  id: UserId;
  fullName: string;
  phone?: string;
  email?: string;
  // Hashed password (only set for users who registered via sign-up)
  passwordHash?: string;
  // Account status for gatekeeper: PENDING -> MEMBER (or ADMIN)
  status?: UserStatus;
  // Foreign key to Household.id (optional until user is approved/assigned)
  householdId?: HouseholdId | null;
  // Example: "adult", "child", "rabbi", etc.
  role?: string;
  // Directory: tags for filtering (e.g. rabbi, doctor, volunteer)
  directoryTags?: DirectoryTag[];
  // Privacy: whether to show in directory listing
  showPhoneInDirectory?: boolean;
  showEmailInDirectory?: boolean;
};
// NOTE:
// This file now intentionally contains ONLY shared types.
// All data access should go through Supabase-backed modules in `src/lib/db-*.ts`.
