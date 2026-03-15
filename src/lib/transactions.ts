import type { ProjectId } from "./projects";

export type TransactionId = string;

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: TransactionId;
  projectId: ProjectId;
  type: TransactionType;
  amountCents: number;
  description: string;
  date: Date;
  createdAt: Date;
};

const transactions: Transaction[] = [];

function nextId(): TransactionId {
  return `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getTransactionsByProject(projectId: ProjectId): Transaction[] {
  return [...transactions]
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllTransactions(): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBalanceForProject(projectId: ProjectId): number {
  const list = transactions.filter((t) => t.projectId === projectId);
  return list.reduce((sum, t) => sum + (t.type === "income" ? t.amountCents : -t.amountCents), 0);
}

export function addTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Transaction {
  const tx: Transaction = {
    ...data,
    id: nextId(),
    date: new Date(data.date),
    createdAt: new Date(),
  };
  transactions.push(tx);
  return tx;
}

export function deleteTransaction(id: TransactionId): boolean {
  const idx = transactions.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  transactions.splice(idx, 1);
  return true;
}
