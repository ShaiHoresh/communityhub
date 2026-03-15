"use server";

import { redirect } from "next/navigation";
import { createAccessRequest } from "@/lib/access-requests";

export async function requestAccessAction(formData: FormData): Promise<void> {
  const type = formData.get("type") as "new_household" | "join_household" | null;
  const householdNameOrId = formData.get("householdNameOrId") as string | null;
  const requesterName = formData.get("requesterName") as string | null;
  const requesterEmail = formData.get("requesterEmail") as string | null;
  const requesterPhone = (formData.get("requesterPhone") as string | null) || undefined;
  const secondAdultName = (formData.get("secondAdultName") as string | null) || undefined;
  const secondAdultEmail = (formData.get("secondAdultEmail") as string | null) || undefined;
  const secondAdultPhone = (formData.get("secondAdultPhone") as string | null) || undefined;
  const notes = (formData.get("notes") as string | null) || undefined;

  if (!type || !householdNameOrId?.trim() || !requesterName?.trim() || !requesterEmail?.trim()) {
    redirect("/request-access?error=" + encodeURIComponent("נא למלא שם, אימייל וסוג הבקשה."));
  }

  if (type !== "new_household" && type !== "join_household") {
    redirect("/request-access?error=" + encodeURIComponent("סוג בקשה לא תקין."));
  }

  createAccessRequest({
    type,
    householdNameOrId: householdNameOrId.trim(),
    requesterName: requesterName.trim(),
    requesterEmail: requesterEmail.trim(),
    requesterPhone: requesterPhone?.trim() || undefined,
    secondAdultName: secondAdultName?.trim() || undefined,
    secondAdultEmail: secondAdultEmail?.trim() || undefined,
    secondAdultPhone: secondAdultPhone?.trim() || undefined,
    notes: notes?.trim() || undefined,
  });

  redirect("/?request=submitted");
}
