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

// In this starter version we use in-memory collections to represent the
// "tables". Later these can be replaced with a real database without
// changing the rest of the app too much.
const households: Household[] = [];
const users: User[] = [];

export function getHouseholds(): Household[] {
  return households;
}

export function getUsers(): User[] {
  return users;
}

export function createHousehold(name: string): Household {
  const household: Household = {
    id: `hh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    memberIds: [],
    managerIds: [],
  };

  households.push(household);
  return household;
}

export function createUser(data: Omit<User, "id">): User {
  const user: User = {
    ...data,
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
  };

  users.push(user);

  if (user.householdId) {
    const household = households.find((h) => h.id === user.householdId);
    if (household && !household.memberIds.includes(user.id)) {
      household.memberIds.push(user.id);
    }
  }

  return user;
}

export function assignUserToHousehold(userId: UserId, householdId: HouseholdId) {
  const user = users.find((u) => u.id === userId);
  const household = households.find((h) => h.id === householdId);

  if (!user || !household) return;

  user.householdId = householdId;
  if (!household.memberIds.includes(userId)) {
    household.memberIds.push(userId);
  }
}

/** Multi-Manager: multiple users (e.g. spouses) can manage the same household. */
export function setHouseholdManagers(
  householdId: HouseholdId,
  managerIds: UserId[],
) {
  const household = households.find((h) => h.id === householdId);
  if (!household) return;

  // Ensure managers are members of the same household.
  const validManagers = managerIds.filter((id) =>
    household.memberIds.includes(id),
  );

  household.managerIds = validManagers;
}

/** Add one manager (e.g. second spouse) without removing existing managers. */
export function addHouseholdManager(
  householdId: HouseholdId,
  userId: UserId,
): boolean {
  const household = households.find((h) => h.id === householdId);
  if (!household) return false;
  if (!household.memberIds.includes(userId)) return false;
  if (household.managerIds.includes(userId)) return true;
  household.managerIds.push(userId);
  return true;
}

export function isHouseholdManager(
  userId: UserId,
  householdId: HouseholdId,
): boolean {
  const household = households.find((h) => h.id === householdId);
  return household?.managerIds.includes(userId) ?? false;
}

export function getHouseholdById(id: HouseholdId): Household | undefined {
  return households.find((h) => h.id === id);
}

export function getUserById(id: UserId): User | undefined {
  return users.find((u) => u.id === id);
}

export function updateUserDirectory(
  userId: UserId,
  update: {
    directoryTags?: DirectoryTag[];
    showPhoneInDirectory?: boolean;
    showEmailInDirectory?: boolean;
  }
): boolean {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  if (update.directoryTags !== undefined) user.directoryTags = update.directoryTags;
  if (update.showPhoneInDirectory !== undefined)
    user.showPhoneInDirectory = update.showPhoneInDirectory;
  if (update.showEmailInDirectory !== undefined)
    user.showEmailInDirectory = update.showEmailInDirectory;
  return true;
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email?.toLowerCase() === normalized);
}

export function setUserStatus(userId: UserId, status: UserStatus): boolean {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  user.status = status;
  return true;
}

/** Users who signed up and are waiting for admin to promote to MEMBER. */
export function getPendingUsers(): User[] {
  return users.filter((u) => u.status === "PENDING");
}

