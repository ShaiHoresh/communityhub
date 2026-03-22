import bcrypt from "bcryptjs";
import type { UserStatus } from "./households";
import { dbCreatePendingUser, dbFindUserByEmail } from "@/lib/db-users";

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
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  if (!email || !fullName) {
    return { ok: false, error: "נא למלא אימייל ושם מלא." };
  }
  if (!input.password || input.password.length < 8) {
    return { ok: false, error: "הסיסמה חייבת להכיל לפחות 8 תווים." };
  }
  const existing = await dbFindUserByEmail(email);
  if (existing) return { ok: false, error: "משתמש עם אימייל זה כבר קיים." };

  const passwordHash = await hashPassword(input.password);
  const created = await dbCreatePendingUser({ email, fullName, passwordHash });
  return { ok: true, userId: created.id };
}

export async function verifyCredentials(
  email: string,
  password: string
): Promise<
  | { ok: true; userId: string; status: UserStatus }
  | { ok: false; error: string }
> {
  const user = await dbFindUserByEmail(email);
  if (!user) {
    return { ok: false, error: "אימייל או סיסמה לא נכונים." };
  }
  if (!user.password_hash) {
    return { ok: false, error: "חשבון זה לא מוגדר להתחברות בסיסמה. פנה להנהלה." };
  }
  const match = await verifyPassword(password, user.password_hash);
  if (!match) {
    return { ok: false, error: "אימייל או סיסמה לא נכונים." };
  }
  const status = user.status ?? "PENDING";
  return { ok: true, userId: user.id, status };
}
