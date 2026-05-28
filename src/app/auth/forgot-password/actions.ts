"use server";

import { dbFindUserByEmail } from "@/lib/db-users";
import { dbCreateResetToken } from "@/lib/db-password-reset";
import { type ActionResult, parseFormString, safeAction } from "@/lib/action-utils";

/**
 * Generate a password-reset token for the given email.
 *
 * Returns:
 *  - { ok: true }              — in production (URL sent by email only)
 *  - { ok: true, resetUrl }   — in development only, when no email provider
 *                               is configured, so the developer can copy-paste it.
 *
 * The response is always { ok: true } even when the email is unknown to
 * prevent email-enumeration attacks.
 */
export async function requestPasswordResetAction(
  _prevState: ActionResult & { resetUrl?: string },
  formData: FormData,
): Promise<ActionResult & { resetUrl?: string }> {
  return safeAction(async () => {
    const email = parseFormString(formData, "email")?.toLowerCase().trim();
    if (!email) return { ok: false, error: "נא להזין כתובת אימייל." };

    const user = await dbFindUserByEmail(email);
    if (!user) {
      // Return ok=true to avoid revealing whether the email is registered.
      return { ok: true };
    }

    const rawToken = await dbCreateResetToken(email);
    const baseUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${rawToken}`;

    // ── Email sending ──────────────────────────────────────────────────────
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
        return { ok: true };
      } catch {
        // Email delivery failed in production — never expose the URL to the client.
        return { ok: true };
      }
    }

    // No email provider configured.
    // In development: expose the URL so the developer can test the flow.
    // In production: log server-side only — never send to the client.
    if (process.env.NODE_ENV === "development") {
      return { ok: true, resetUrl };
    }

    // Production fallback — token is created but cannot be delivered.
    // This indicates a misconfiguration; log it server-side.
    console.error(
      "[password-reset] RESEND_API_KEY is not set. Token created but not delivered for:",
      email,
    );
    return { ok: true };
  });
}
