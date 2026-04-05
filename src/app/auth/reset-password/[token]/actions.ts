"use server";

import { dbValidateResetToken, dbConsumeResetToken } from "@/lib/db-password-reset";
import { dbFindUserByEmail, dbUpdateUserPassword } from "@/lib/db-users";
import { hashPassword } from "@/lib/auth";
import { type ActionResult, parseFormString, safeAction } from "@/lib/action-utils";

export async function resetPasswordAction(
  token: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    const newPassword = parseFormString(formData, "password");
    const confirmPassword = parseFormString(formData, "confirmPassword");

    if (!newPassword || newPassword.length < 8) {
      return { ok: false, error: "הסיסמה חייבת להכיל לפחות 8 תווים." };
    }
    if (newPassword !== confirmPassword) {
      return { ok: false, error: "הסיסמאות אינן תואמות." };
    }

    const email = await dbValidateResetToken(token);
    if (!email) {
      return {
        ok: false,
        error: "הקישור אינו תקף או פג תוקפו. בקש קישור חדש.",
      };
    }

    const user = await dbFindUserByEmail(email);
    if (!user) {
      return { ok: false, error: "משתמש לא נמצא." };
    }

    const newHash = await hashPassword(newPassword);
    await dbUpdateUserPassword(user.id, newHash);
    await dbConsumeResetToken(token);

    return { ok: true };
  });
}
