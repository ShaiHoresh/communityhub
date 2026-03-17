export type AccessRequestId = string;

export type AccessRequestType = "new_household" | "join_household";

export type AccessRequest = {
  id: AccessRequestId;
  type: AccessRequestType;
  /** For new_household: desired household name. For join_household: existing household id. */
  householdNameOrId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  /** Optional second adult (e.g. spouse) for new household – both become managers. */
  secondAdultName?: string;
  secondAdultEmail?: string;
  secondAdultPhone?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
};
import {
  dbApproveAccessRequest,
  dbCreateAccessRequest,
  dbGetAccessRequestById,
  dbGetPendingAccessRequests,
  dbRejectAccessRequest,
} from "@/lib/db-access-requests";

export async function getPendingAccessRequests(): Promise<AccessRequest[]> {
  return dbGetPendingAccessRequests();
}

export async function getAccessRequestById(
  id: AccessRequestId,
): Promise<AccessRequest | undefined> {
  const r = await dbGetAccessRequestById(id);
  return r ?? undefined;
}

export async function createAccessRequest(
  data: Omit<AccessRequest, "id" | "status" | "createdAt">,
): Promise<AccessRequest> {
  return dbCreateAccessRequest(data);
}

export async function approveAccessRequest(
  id: AccessRequestId,
  reviewedBy: string,
): Promise<{ success: boolean; error?: string }> {
  const existing = await dbGetAccessRequestById(id);
  if (!existing) return { success: false, error: "בקשה לא נמצאה" };
  if (existing.status !== "pending") return { success: false, error: "בקשה כבר טופלה" };
  return dbApproveAccessRequest(id, reviewedBy);
}

export async function rejectAccessRequest(
  id: AccessRequestId,
  reviewedBy: string,
): Promise<{ success: boolean; error?: string }> {
  const existing = await dbGetAccessRequestById(id);
  if (!existing) return { success: false, error: "בקשה לא נמצאה" };
  if (existing.status !== "pending") return { success: false, error: "בקשה כבר טופלה" };
  return dbRejectAccessRequest(id, reviewedBy);
}
