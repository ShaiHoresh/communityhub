import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

type DvarTorahRow = {
  id: string;
  title: string;
  author: string;
  body: string;
  parasha: string;
  date: string;
  created_at: string;
};

export type DbDvarTorah = {
  id: string;
  title: string;
  author: string;
  body: string;
  parasha: string;
  date: Date;
  createdAt: Date;
};

function mapRow(r: DvarTorahRow): DbDvarTorah {
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    body: r.body,
    parasha: r.parasha,
    date: new Date(r.date),
    createdAt: new Date(r.created_at),
  };
}

const SELECT = "id, title, author, body, parasha, date, created_at";

/** Returns the single most recent entry (for homepage preview). */
export async function dbGetLatestDvarTorah(): Promise<DbDvarTorah | null> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("dvar_torah")
    .select(SELECT)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as DvarTorahRow) : null;
}

/** Returns all entries ordered newest first (for admin + archive page). */
export async function dbGetAllDvarTorah(): Promise<DbDvarTorah[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(
    await sb.from("dvar_torah").select(SELECT).order("date", { ascending: false }),
  );
  return data.map(mapRow);
}

export async function dbAddDvarTorah(input: {
  title: string;
  author: string;
  body: string;
  parasha: string;
  date: string;
}): Promise<DbDvarTorah> {
  const sb = supabaseAdmin();
  const data = unwrap(
    await sb
      .from("dvar_torah")
      .insert({
        title: input.title,
        author: input.author,
        body: input.body,
        parasha: input.parasha,
        date: input.date,
      })
      .select(SELECT)
      .single(),
  );
  return mapRow(data as DvarTorahRow);
}

export async function dbDeleteDvarTorah(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("dvar_torah").delete().eq("id", id);
  if (error) throw error;
}
