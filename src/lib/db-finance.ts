import { supabaseAdmin } from "@/lib/supabase-admin";
import { unwrap, unwrapList } from "@/lib/supabase-helpers";

type ProjectRow = { id: string; name: string; created_at: string };
type TransactionRow = { id: string; project_id: string; type: string; amount_cents: number; description: string | null; date: string; created_at: string };
type BalanceRow = { type: string; amount_cents: number };

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

function mapProject(r: ProjectRow): DbProject {
  return { id: r.id, name: r.name, createdAt: new Date(r.created_at) };
}

function mapTx(r: TransactionRow): DbTransaction {
  return {
    id: r.id,
    projectId: r.project_id,
    type: r.type as "income" | "expense",
    amountCents: Number(r.amount_cents),
    description: r.description ?? "",
    date: new Date(r.date),
    createdAt: new Date(r.created_at),
  };
}

export async function dbGetProjects(): Promise<DbProject[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(await sb.from("projects").select("id, name, created_at").order("created_at", { ascending: true }));
  return data.map(mapProject);
}

export async function dbCreateProject(name: string): Promise<DbProject> {
  const sb = supabaseAdmin();
  const data = unwrap(await sb.from("projects").insert({ name }).select("id, name, created_at").single());
  return mapProject(data);
}

export async function dbGetAllTransactions(): Promise<DbTransaction[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(await sb
    .from("transactions")
    .select("id, project_id, type, amount_cents, description, date, created_at")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false }));
  return data.map(mapTx);
}

export async function dbGetTransactionsByProject(projectId: string): Promise<DbTransaction[]> {
  const sb = supabaseAdmin();
  const data = unwrapList(await sb
    .from("transactions")
    .select("id, project_id, type, amount_cents, description, date, created_at")
    .eq("project_id", projectId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false }));
  return data.map(mapTx);
}

export async function dbAddTransaction(input: {
  projectId: string;
  type: "income" | "expense";
  amountCents: number;
  description: string;
  date: Date;
}): Promise<DbTransaction> {
  const sb = supabaseAdmin();
  const data = unwrap(await sb
    .from("transactions")
    .insert({
      project_id: input.projectId,
      type: input.type,
      amount_cents: input.amountCents,
      description: input.description,
      date: input.date.toISOString().slice(0, 10),
    })
    .select("id, project_id, type, amount_cents, description, date, created_at")
    .single());
  return mapTx(data);
}

export async function dbGetBalanceForProject(projectId: string): Promise<number> {
  const sb = supabaseAdmin();
  const data = unwrapList(await sb
    .from("transactions")
    .select("type, amount_cents")
    .eq("project_id", projectId));
  return data.reduce((sum: number, t: BalanceRow) => {
    const cents = Number(t.amount_cents);
    return sum + (t.type === "income" ? cents : -cents);
  }, 0);
}

