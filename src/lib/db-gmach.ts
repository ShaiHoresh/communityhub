import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

type GmachPostRow = { id: string; category_id: string; title: string; description: string | null; contact_info: string | null; is_pinned_by_committee: boolean; created_at: string };

export type DbGmachPost = {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  contactInfo?: string;
  isPinnedByCommittee: boolean;
  createdAt: Date;
};

function mapRow(r: GmachPostRow): DbGmachPost {
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

  const data = unwrapList(await q
    .order("is_pinned_by_committee", { ascending: false })
    .order("created_at", { ascending: false }));
  return data.map(mapRow);
}

export async function dbAddGmachPost(input: {
  categoryId: string;
  title: string;
  description?: string;
  contactInfo?: string;
}): Promise<DbGmachPost> {
  const sb = supabaseAdmin();
  const data = unwrap(await sb
    .from("gmach_posts")
    .insert({
      category_id: input.categoryId,
      title: input.title,
      description: input.description ?? null,
      contact_info: input.contactInfo ?? null,
    })
    .select("id, category_id, title, description, contact_info, is_pinned_by_committee, created_at")
    .single());
  return mapRow(data);
}

type GmachPinnedRow = { id: string; is_pinned_by_committee: boolean };

export async function dbToggleGmachPinned(itemId: string): Promise<void> {
  const sb = supabaseAdmin();
  const row = unwrap(await sb
    .from("gmach_posts")
    .select("id, is_pinned_by_committee")
    .eq("id", itemId)
    .single()) as GmachPinnedRow;

  const nextPinned = !row.is_pinned_by_committee;
  unwrap(await sb
    .from("gmach_posts")
    .update({ is_pinned_by_committee: nextPinned })
    .eq("id", itemId)
    .select()
    .single());
}

export async function dbEnsureGmachCategories(categories: Array<{ id: string; label: string; color: string }>) {
  const sb = supabaseAdmin();
  const { error } = await sb.from("gmach_categories").upsert(
    categories.map((c) => ({ id: c.id, label: c.label, color: c.color })),
    { onConflict: "id" },
  );
  if (error) throw error;
}

