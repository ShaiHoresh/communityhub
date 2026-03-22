"use server";

import {
  approveAccessRequest,
  getAccessRequestById,
  rejectAccessRequest,
} from "@/lib/access-requests";
import { dbSetUserStatus } from "@/lib/db-users";
import {
  dbAddHouseholdManager,
  dbCreateHousehold,
  dbCreateHouseholdUser,
  dbGetHouseholdById,
} from "@/lib/db-households";
import { requireAdmin } from "@/lib/auth-guard";
import { type ActionResult, revalidateAdminPaths } from "@/lib/action-utils";

const REVIEWED_BY = "admin";

export async function approveAccessRequestAction(
  requestId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const request = await getAccessRequestById(requestId);
  if (!request || request.status !== "pending") {
    return { ok: false, error: "בקשה לא נמצאה או כבר טופלה." };
  }

  if (request.type === "new_household") {
    const household = await dbCreateHousehold(request.householdNameOrId);
    const user1 = await dbCreateHouseholdUser({
      fullName: request.requesterName,
      email: request.requesterEmail,
      phone: request.requesterPhone,
      householdId: household.id,
      role: "adult",
      status: "MEMBER",
    });
    await dbAddHouseholdManager(household.id, user1.id);

    if (request.secondAdultName && request.secondAdultEmail) {
      const user2 = await dbCreateHouseholdUser({
        fullName: request.secondAdultName,
        email: request.secondAdultEmail,
        phone: request.secondAdultPhone,
        householdId: household.id,
        role: "adult",
        status: "MEMBER",
      });
      await dbAddHouseholdManager(household.id, user2.id);
    }
  } else {
    const household = await dbGetHouseholdById(request.householdNameOrId);
    if (household) {
      const user1 = await dbCreateHouseholdUser({
        fullName: request.requesterName,
        email: request.requesterEmail,
        phone: request.requesterPhone,
        householdId: household.id,
        role: "adult",
        status: "MEMBER",
      });
      await dbAddHouseholdManager(household.id, user1.id);

      if (request.secondAdultName && request.secondAdultEmail) {
        const user2 = await dbCreateHouseholdUser({
          fullName: request.secondAdultName,
          email: request.secondAdultEmail,
          phone: request.secondAdultPhone,
          householdId: household.id,
          role: "adult",
          status: "MEMBER",
        });
        await dbAddHouseholdManager(household.id, user2.id);
      }
    }
  }

  await approveAccessRequest(requestId, REVIEWED_BY);
  revalidateAdminPaths();
  return { ok: true };
}

export async function rejectAccessRequestAction(
  requestId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const result = await rejectAccessRequest(requestId, REVIEWED_BY);
  if (!result.ok) return result;
  revalidateAdminPaths();
  return { ok: true };
}

export async function approvePendingUserAction(
  userId: string,
): Promise<ActionResult> {
  await requireAdmin();
  await dbSetUserStatus(userId, "MEMBER");
  revalidateAdminPaths();
  return { ok: true };
}
