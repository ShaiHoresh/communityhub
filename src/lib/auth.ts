import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "./households";
import type { UserStatus } from "./households";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
};

export async function registerUser(
  input: RegisterInput
): Promise<{ success: true; userId: string } | { success: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email || !fullName) {
    return { success: false, error: "נא למלא אימייל ושם מלא." };
  }
  if (!input.password || input.password.length < 8) {
    return { success: false, error: "הסיסמה חייבת להכיל לפחות 8 תווים." };
  }
  if (findUserByEmail(email)) {
    return { success: false, error: "משתמש עם אימייל זה כבר קיים." };
  }
  const passwordHash = await hashPassword(input.password);
  const user = createUser({
    email,
    fullName,
    passwordHash,
    status: "PENDING",
  });
  return { success: true, userId: user.id };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<
  | { success: true; userId: string; status: UserStatus }
  | { success: false; error: string }
> {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: "אימייל או סיסמה לא נכונים." };
  }
  if (!user.passwordHash) {
    return { success: false, error: "חשבון זה לא מוגדר להתחברות בסיסמה. פנה להנהלה." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { success: false, error: "אימייל או סיסמה לא נכונים." };
  }
  const status = user.status ?? "PENDING";
  return { success: true, userId: user.id, status };
}
