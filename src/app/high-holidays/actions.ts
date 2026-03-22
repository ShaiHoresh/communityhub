"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { addHighHolidayRegistration, type HighHolidaySlot } from "@/lib/high-holidays";
import { dbGetUserHouseholdId } from "@/lib/db-users";
import { dbGetHouseholdById, dbIsHouseholdManager } from "@/lib/db-households";
import { dbGetHhPrayers } from "@/lib/db-hh-prayers";
import {
  type ActionResult,
  parseFormInt,
  revalidateAppPaths,
  safeAction,
} from "@/lib/action-utils";

export async function submitHighHolidayRegistration(
  formData: FormData,
): Promise<ActionResult> {
  return safeAction(async () => {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { userId?: string })?.userId;

    if (!session || !userId) {
      return { ok: false, error: "יש להתחבר כדי להירשם." };
    }

    const householdId = await dbGetUserHouseholdId(userId);
    if (!householdId) {
      return { ok: false, error: "לא משויך למשק בית. פנה להנהלת הקהילה." };
    }

    const isManager = await dbIsHouseholdManager(householdId, userId);
    if (!isManager) {
      return { ok: false, error: "רק מנהל משק בית יכול לרשום מקומות." };
    }

    const household = await dbGetHouseholdById(householdId);
    const householdName = household?.name ?? "";

    const prayers = await dbGetHhPrayers();
    const seats = prayers.map((p) => ({
      prayerId: p.id,
      menSeats: parseFormInt(formData, `men_${p.id}`, 0),
      womenSeats: parseFormInt(formData, `women_${p.id}`, 0),
    }));

    const committees = formData.getAll("committees") as string[];
    const prepSlotRaw = formData.get("prepSlot") as string | null;
    const prepSlot = prepSlotRaw ? (prepSlotRaw as HighHolidaySlot) : null;

    const committeeInterest =
      committees.length === 0 ? "" : `ועדות: ${committees.join(", ")}`;

    const result = await addHighHolidayRegistration({
      householdId,
      householdName,
      seats,
      committeeInterest,
      prepSlot,
    });

    if (!result.ok) return result;

    revalidateAppPaths();
    return { ok: true };
  });
}
