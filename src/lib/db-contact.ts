import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

type ContactMessageRow = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type DbContactMessage = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

function mapRow(r: ContactMessageRow): DbContactMessage {
  return {
    id: r.id,
    userId: r.user_id ?? undefined,
    name: r.name,
    email: r.email,
    subject: r.subject,
    message: r.message,
    isRead: !!r.is_read,
    createdAt: new Date(r.created_at),
  };
}

const SELECT = "id, user_id, name, email, subject, message, is_read, created_at";

export async function dbAddContactMessage(input: {
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("contact_messages").insert({
    user_id: input.userId ?? null,
    name: input.name,
    email: input.email.trim().toLowerCase(),
    subject: input.subject,
    message: input.message,
  });
  if (error) throw error;
}

export async function dbGetAllContactMessages(): Promise<DbContactMessage[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(
    await sb
      .from("contact_messages")
      .select(SELECT)
      .order("is_read", { ascending: true })
      .order("created_at", { ascending: false }),
  );
  return data.map(mapRow);
}

export async function dbMarkContactMessageRead(id: string, isRead: boolean): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);
  if (error) throw error;
}

export async function dbDeleteContactMessage(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}

export async function dbGetUnreadContactCount(): Promise<number> {
  const sb = supabaseAdmin();
  const { count, error } = await sb
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  if (error) throw error;
  return count ?? 0;
}
