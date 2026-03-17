import { supabaseAdmin } from "@/lib/supabase-admin";

export type DbProject = { id: string; name: string; createdAt: Date };
export type DbTransaction = {
  id: string;
  projectId: string;
  type: "income" | "expense";
  amountCents: number;
  description: string;
  date: Date;
  createdAt: Date;
};

function mapProject(r: any): DbProject {
  return { id: r.id, name: r.name, createdAt: new Date(r.created_at) };
}

function mapTx(r: any): DbTransaction {
  return {
    id: r.id,
    projectId: r.project_id,
    type: r.type,
    amountCents: Number(r.amount_cents),
    description: r.description ?? "",
    date: new Date(r.date),
    createdAt: new Date(r.created_at),
  };
}

export async function dbGetProjects(): Promise<DbProject[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("projects").select("id, name, created_at").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProject);
}

export async function dbCreateProject(name: string): Promise<DbProject> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("projects").insert({ name }).select("id, name, created_at").single();
  if (error) throw error;
  return mapProject(data);
}

export async function dbGetAllTransactions(): Promise<DbTransaction[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("transactions")
    .select("id, project_id, type, amount_cents, description, date, created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTx);
}

export async function dbGetTransactionsByProject(projectId: string): Promise<DbTransaction[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("transactions")
    .select("id, project_id, type, amount_cents, description, date, created_at")
    .eq("project_id", projectId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTx);
}

export async function dbAddTransaction(input: {
  projectId: string;
  type: "income" | "expense";
  amountCents: number;
  description: string;
  date: Date;
}): Promise<DbTransaction> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("transactions")
    .insert({
      project_id: input.projectId,
      type: input.type,
      amount_cents: input.amountCents,
      description: input.description,
      date: input.date.toISOString().slice(0, 10),
    })
    .select("id, project_id, type, amount_cents, description, date, created_at")
    .single();
  if (error) throw error;
  return mapTx(data);
}

export async function dbGetBalanceForProject(projectId: string): Promise<number> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("transactions")
    .select("type, amount_cents")
    .eq("project_id", projectId);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, t: any) => {
    const cents = Number(t.amount_cents);
    return sum + (t.type === "income" ? cents : -cents);
  }, 0);
}

