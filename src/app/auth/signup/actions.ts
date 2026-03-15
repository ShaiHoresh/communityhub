"use server";

import { registerUser } from "@/lib/auth";

export async function registerAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const fullName = (formData.get("fullName") as string)?.trim() ?? "";
  return registerUser({ email, password, fullName });
}
