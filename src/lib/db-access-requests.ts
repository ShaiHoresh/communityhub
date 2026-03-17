import { supabaseAdmin } from "@/lib/supabase-admin";

export type AccessRequestType = "new_household" | "join_household";
export type AccessRequestStatus = "pending" | "approved" | "rejected";

export type DbAccessRequest = {
  id: string;
  type: AccessRequestType;
  householdNameOrId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  secondAdultName?: string;
  secondAdultEmail?: string;
  secondAdultPhone?: string;
  notes?: string;
  status: AccessRequestStatus;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
};

function mapRow(r: any): DbAccessRequest {
  return {
    id: r.id,
    type: r.type,
    householdNameOrId: r.household_name_or_id,
    requesterName: r.requester_name,
    requesterEmail: r.requester_email,
    requesterPhone: r.requester_phone ?? undefined,
    secondAdultName: r.second_adult_name ?? undefined,
    secondAdultEmail: r.second_adult_email ?? undefined,
    secondAdultPhone: r.second_adult_phone ?? undefined,
    notes: r.notes ?? undefined,
    status: r.status,
    createdAt: new Date(r.created_at),
    reviewedAt: r.reviewed_at ? new Date(r.reviewed_at) : undefined,
    reviewedBy: r.reviewed_by ?? undefined,
  };
}

export async function dbCreateAccessRequest(input: {
  type: AccessRequestType;
  householdNameOrId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  secondAdultName?: string;
  secondAdultEmail?: string;
  secondAdultPhone?: string;
  notes?: string;
}): Promise<DbAccessRequest> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("access_requests")
    .insert({
      type: input.type,
      household_name_or_id: input.householdNameOrId,
      requester_name: input.requesterName,
      requester_email: input.requesterEmail,
      requester_phone: input.requesterPhone ?? null,
      second_adult_name: input.secondAdultName ?? null,
      second_adult_email: input.secondAdultEmail ?? null,
      second_adult_phone: input.secondAdultPhone ?? null,
      notes: input.notes ?? null,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function dbGetPendingAccessRequests(): Promise<DbAccessRequest[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("access_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function dbGetAccessRequestById(id: string): Promise<DbAccessRequest | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("access_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function dbApproveAccessRequest(
  id: string,
  reviewedBy: string,
): Promise<{ success: boolean; error?: string }> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("access_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw error;
  return { success: true };
}

export async function dbRejectAccessRequest(
  id: string,
  reviewedBy: string,
): Promise<{ success: boolean; error?: string }> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("access_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw error;
  return { success: true };
}

