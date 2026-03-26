"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { dbFindUserByEmail } from "@/lib/db-users";
import { dbUpdateUserProfile, dbUpdateUserPassword } from "@/lib/db-users";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { type ActionResult, parseFormString, safeAction } from "@/lib/action-utils";

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { userId?: string })?.userId;
    if (!userId) return { ok: false, error: "לא מחובר." };

    const fullName = parseFormString(formData, "fullName");
    const phone = parseFormString(formData, "phone");
    const showPhoneInDir = formData.get("showPhoneInDir") === "on";
    const showEmailInDir = formData.get("showEmailInDir") === "on";

    if (!fullName) return { ok: false, error: "שם מלא הוא שדה חובה." };

    await dbUpdateUserProfile(userId, { fullName, phone, showPhoneInDir, showEmailInDir });
    revalidatePath("/profile");
    revalidatePath("/directory");
    return { ok: true };
  });
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { userId?: string })?.userId;
    const userEmail = session?.user?.email;
    if (!userId || !userEmail) return { ok: false, error: "לא מחובר." };

    const currentPassword = parseFormString(formData, "currentPassword");
    const newPassword = parseFormString(formData, "newPassword");
    const confirmPassword = parseFormString(formData, "confirmPassword");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { ok: false, error: "כל השדות הם חובה." };
    }
    if (newPassword.length < 8) {
      return { ok: false, error: "הסיסמה החדשה חייבת להכיל לפחות 8 תווים." };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, error: "הסיסמאות אינן תואמות." };
    }

    const user = await dbFindUserByEmail(userEmail);
    if (!user?.password_hash) {
      return { ok: false, error: "לא ניתן לשנות סיסמה לחשבון זה." };
    }

    const match = await verifyPassword(currentPassword, user.password_hash);
    if (!match) return { ok: false, error: "הסיסמה הנוכחית שגויה." };

    const newHash = await hashPassword(newPassword);
    await dbUpdateUserPassword(userId, newHash);
    return { ok: true };
  });
}
