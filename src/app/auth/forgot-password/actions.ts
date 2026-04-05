"use server";

import { dbFindUserByEmail } from "@/lib/db-users";
import { dbCreateResetToken } from "@/lib/db-password-reset";
import { type ActionResult, parseFormString, safeAction } from "@/lib/action-utils";

/**
 * Generate a password-reset token for the given email.
 *
 * Returns:
 *  - { ok: true, resetUrl }  — always, even if the email doesn't exist
 *    (prevents email-enumeration). The `resetUrl` is only populated when
 *    RESEND_API_KEY is NOT configured, so the admin can copy-paste it.
 *    When email is configured, it is sent silently and resetUrl is undefined.
 */
export async function requestPasswordResetAction(
  _prevState: ActionResult & { resetUrl?: string },
  formData: FormData,
): Promise<ActionResult & { resetUrl?: string }> {
  return safeAction(async () => {
    const email = parseFormString(formData, "email")?.toLowerCase().trim();
    if (!email) return { ok: false, error: "נא להזין כתובת אימייל." };

    // Always look up the user so we can fail fast on invalid emails
    // while still not leaking whether the email exists.
    const user = await dbFindUserByEmail(email);

    if (!user) {
      // Return ok=true to avoid revealing whether the email is registered.
      return { ok: true };
    }

    const rawToken = await dbCreateResetToken(email);
    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${rawToken}`;

    // ── Email sending (optional) ──────────────────────────────────────────
    // Set RESEND_API_KEY in .env to enable automatic email delivery.
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESET_EMAIL_FROM ?? "no-reply@beorcha.co.il";

    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: "איפוס סיסמה – קהילת באורך",
            html: `
              <div dir="rtl" style="font-family: sans-serif; max-width: 480px;">
                <h2>איפוס סיסמה</h2>
                <p>לחץ על הכפתור הבא לאיפוס הסיסמה שלך. הקישור תקף לשעה אחת.</p>
                <a href="${resetUrl}"
                   style="display:inline-block;background:#111827;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;">
                  איפוס סיסמה
                </a>
                <p style="margin-top:16px;font-size:13px;color:#666;">
                  אם לא ביקשת איפוס, ניתן להתעלם מהודעה זו.
                </p>
              </div>`,
          }),
        });
        // Email sent — don't expose the URL
        return { ok: true };
      } catch {
        // Email failed but token was created — fall through and expose the URL
      }
    }

    // No email service configured (or send failed) → expose the URL directly
    // so the admin / user can copy-paste it.
    return { ok: true, resetUrl };
  });
}
