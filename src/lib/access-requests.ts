export type { AccessRequestType, AccessRequestStatus } from "@/lib/db-access-requests";
export type { DbAccessRequest as AccessRequest } from "@/lib/db-access-requests";
import type { DbAccessRequest as AccessRequest } from "@/lib/db-access-requests";

export type AccessRequestId = string;

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
