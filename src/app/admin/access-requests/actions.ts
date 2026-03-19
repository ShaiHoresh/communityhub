"use server";

import { revalidatePath } from "next/cache";
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

const REVIEWED_BY = "admin";

export async function approveAccessRequestAction(requestId: string) {
  await requireAdmin();
  const request = await getAccessRequestById(requestId);
  if (!request || request.status !== "pending") {
    return { success: false, error: "בקשה לא נמצאה או כבר טופלה." };
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
    // join_household: householdNameOrId can be household id
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
  revalidatePath("/admin/access-requests");
  return { success: true };
}

export async function rejectAccessRequestAction(requestId: string) {
  await requireAdmin();
  const result = await rejectAccessRequest(requestId, REVIEWED_BY);
  if (!result.success) return result;
  revalidatePath("/admin/access-requests");
  return result;
}

/** Promote a PENDING user (signed up) to MEMBER. */
export async function approvePendingUserAction(userId: string) {
  await requireAdmin();
  await dbSetUserStatus(userId, "MEMBER");
  revalidatePath("/admin/access-requests");
  return { success: true };
}
