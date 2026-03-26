import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  expires_at: string | null;
  created_at: string;
};

export type DbAnnouncement = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  expiresAt?: Date;
  createdAt: Date;
};

function mapRow(r: AnnouncementRow): DbAnnouncement {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    isPinned: !!r.is_pinned,
    expiresAt: r.expires_at ? new Date(r.expires_at) : undefined,
    createdAt: new Date(r.created_at),
  };
}

const SELECT = "id, title, body, is_pinned, expires_at, created_at";

/**
 * Returns non-expired announcements for display on the homepage.
 * Pinned entries appear first.
 */
export async function dbGetActiveAnnouncements(): Promise<DbAnnouncement[]> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const data = unwrapList(
    await sb
      .from("announcements")
      .select(SELECT)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false }),
  );
  return data.map(mapRow);
}

/** Returns all announcements (including expired) for the admin view. */
export async function dbGetAllAnnouncements(): Promise<DbAnnouncement[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(
    await sb
      .from("announcements")
      .select(SELECT)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false }),
  );
  return data.map(mapRow);
}

export async function dbAddAnnouncement(input: {
  title: string;
  body: string;
  isPinned: boolean;
  expiresAt?: string;
}): Promise<DbAnnouncement> {
  const sb = supabaseAdmin();
  const data = unwrap(
    await sb
      .from("announcements")
      .insert({
        title: input.title,
        body: input.body,
        is_pinned: input.isPinned,
        expires_at: input.expiresAt ?? null,
      })
      .select(SELECT)
      .single(),
  );
  return mapRow(data as AnnouncementRow);
}

export async function dbDeleteAnnouncement(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("announcements").delete().eq("id", id);
  if (error) throw error;
}

export async function dbToggleAnnouncementPin(id: string, isPinned: boolean): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("announcements")
    .update({ is_pinned: isPinned })
    .eq("id", id);
  if (error) throw error;
}
