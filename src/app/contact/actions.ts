"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { dbAddContactMessage } from "@/lib/db-contact";
import {
  type ActionResult,
  parseFormString,
  safeAction,
} from "@/lib/action-utils";

export async function submitContactAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const name = parseFormString(formData, "name");
    const email = parseFormString(formData, "email");
    const subject = parseFormString(formData, "subject");
    const message = parseFormString(formData, "message");

    if (!name || !email || !subject || !message) {
      return { ok: false, error: "כל השדות הסומנים ב-* הם שדות חובה." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "כתובת אימייל לא תקינה." };
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { userId?: string })?.userId;

    await dbAddContactMessage({ userId, name, email, subject, message });
    return { ok: true };
  });
}
