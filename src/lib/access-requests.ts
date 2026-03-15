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

const accessRequests: AccessRequest[] = [];

function nextId(): AccessRequestId {
  return `ar_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getAllAccessRequests(): AccessRequest[] {
  return [...accessRequests];
}

export function getPendingAccessRequests(): AccessRequest[] {
  return accessRequests.filter((r) => r.status === "pending");
}

export function getAccessRequestById(id: AccessRequestId): AccessRequest | undefined {
  return accessRequests.find((r) => r.id === id);
}

export function createAccessRequest(
  data: Omit<AccessRequest, "id" | "status" | "createdAt">,
): AccessRequest {
  const request: AccessRequest = {
    ...data,
    id: nextId(),
    status: "pending",
    createdAt: new Date(),
  };
  accessRequests.push(request);
  return request;
}

export function approveAccessRequest(
  id: AccessRequestId,
  reviewedBy: string,
): { success: boolean; error?: string } {
  const request = accessRequests.find((r) => r.id === id);
  if (!request) return { success: false, error: "בקשה לא נמצאה" };
  if (request.status !== "pending")
    return { success: false, error: "בקשה כבר טופלה" };

  // Approval logic is handled by the server action (create household/user, etc.)
  request.status = "approved";
  request.reviewedAt = new Date();
  request.reviewedBy = reviewedBy;
  return { success: true };
}

export function rejectAccessRequest(
  id: AccessRequestId,
  reviewedBy: string,
): { success: boolean; error?: string } {
  const request = accessRequests.find((r) => r.id === id);
  if (!request) return { success: false, error: "בקשה לא נמצאה" };
  if (request.status !== "pending")
    return { success: false, error: "בקשה כבר טופלה" };

  request.status = "rejected";
  request.reviewedAt = new Date();
  request.reviewedBy = reviewedBy;
  return { success: true };
}
