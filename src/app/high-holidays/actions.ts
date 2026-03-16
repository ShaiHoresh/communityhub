"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { addHighHolidayRegistration, type HighHolidaySlot } from "@/lib/high-holidays";
import { getUsers, getHouseholds } from "@/lib/households";
import { revalidatePath } from "next/cache";

export async function submitHighHolidayRegistration(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { userId?: string })?.userId;
  const fullName = (session?.user as { name?: string; email?: string })?.name ?? session?.user?.email ?? "";

  if (!session || !userId) {
    return { ok: false, error: "יש להתחבר כדי להירשם." };
  }

  const seatsStr = (formData.get("seats") as string) ?? "0";
  const seats = parseInt(seatsStr, 10);
  const committees = formData.getAll("committees") as string[];
  const prepSlotRaw = formData.get("prepSlot") as string | null;
  const prepSlot = prepSlotRaw ? (prepSlotRaw as HighHolidaySlot) : null;

  const committeeInterest =
    committees.length === 0 ? "לא נבחרו ועדות" : `ועדות: ${committees.join(", ")}`;

  const user = getUsers().find((u) => u.id === userId);
  const householdName =
    user?.householdId && getHouseholds().find((h) => h.id === user.householdId)?.name
      ? getHouseholds().find((h) => h.id === user.householdId)!.name
      : undefined;

  const result = addHighHolidayRegistration({
    userId,
    fullName,
    householdName,
    seats,
    committeeInterest,
    prepSlot,
  });

  if (!result.ok) {
    return result;
  }

  revalidatePath("/high-holidays");
  return { ok: true };
}

