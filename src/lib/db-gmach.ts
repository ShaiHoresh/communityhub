import { supabaseAdmin } from "@/lib/supabase-admin";

export type DbGmachPost = {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  contactInfo?: string;
  isPinnedByCommittee: boolean;
  createdAt: Date;
};

function mapRow(r: any): DbGmachPost {
  return {
    id: r.id,
    categoryId: r.category_id,
    title: r.title,
    description: r.description ?? undefined,
    contactInfo: r.contact_info ?? undefined,
    isPinnedByCommittee: !!r.is_pinned_by_committee,
    createdAt: new Date(r.created_at),
  };
}

export async function dbGetGmachPosts(categoryId?: string): Promise<DbGmachPost[]> {
  const sb = supabaseAdmin();
  let q = sb
    .from("gmach_posts")
    .select("id, category_id, title, description, contact_info, is_pinned_by_committee, created_at");
  if (categoryId) q = q.eq("category_id", categoryId);

  // Pinned first, then newest first
  const { data, error } = await q
    .order("is_pinned_by_committee", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function dbAddGmachPost(input: {
  categoryId: string;
  title: string;
  description?: string;
  contactInfo?: string;
}): Promise<DbGmachPost> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("gmach_posts")
    .insert({
      category_id: input.categoryId,
      title: input.title,
      description: input.description ?? null,
      contact_info: input.contactInfo ?? null,
    })
    .select("id, category_id, title, description, contact_info, is_pinned_by_committee, created_at")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function dbToggleGmachPinned(itemId: string): Promise<void> {
  const sb = supabaseAdmin();
  const { data: row, error: readErr } = await sb
    .from("gmach_posts")
    .select("id, is_pinned_by_committee")
    .eq("id", itemId)
    .single();
  if (readErr) throw readErr;

  const nextPinned = !(row as any).is_pinned_by_committee;
  const { error: writeErr } = await sb
    .from("gmach_posts")
    .update({ is_pinned_by_committee: nextPinned })
    .eq("id", itemId);
  if (writeErr) throw writeErr;
}

export async function dbEnsureGmachCategories(categories: Array<{ id: string; label: string; color: string }>) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("gmach_categories").upsert(
    categories.map((c) => ({ id: c.id, label: c.label, color: c.color })),
    { onConflict: "id" },
  );
  if (error) throw error;
}

