import type { ProjectId } from "./projects";
import {
  dbAddTransaction,
  dbGetAllTransactions,
  dbGetBalanceForProject,
  dbGetTransactionsByProject,
} from "@/lib/db-finance";

export type { DbTransaction as Transaction } from "@/lib/db-finance";
import type { DbTransaction as Transaction } from "@/lib/db-finance";

export type TransactionId = string;
export type TransactionType = "income" | "expense";

export async function getTransactionsByProject(projectId: ProjectId): Promise<Transaction[]> {
  return dbGetTransactionsByProject(projectId);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return dbGetAllTransactions();
}

export async function getBalanceForProject(projectId: ProjectId): Promise<number> {
  return dbGetBalanceForProject(projectId);
}

/** Sum of all project balances (for admin overview). */
export async function getTotalBalanceCents(projectIds: ProjectId[]): Promise<number> {
  const balances = await Promise.all(projectIds.map((id) => getBalanceForProject(id)));
  return balances.reduce((sum, b) => sum + b, 0);
}

export function addTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  return dbAddTransaction({
    projectId: data.projectId,
    type: data.type,
    amountCents: data.amountCents,
    description: data.description,
    date: new Date(data.date),
  });
}

// Note: delete is currently unused; add DB delete when needed.
