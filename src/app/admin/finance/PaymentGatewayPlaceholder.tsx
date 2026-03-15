"use client";

import { useState } from "react";
import type { Project } from "@/lib/projects";
import { createPaymentIntent } from "@/lib/payment-gateway";

type Props = { projects: Project[] };

export function PaymentGatewayPlaceholder({ projects }: Props) {
  const [result, setResult] = useState<{ message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const amount = form.amount.value;
    const projectId = form.projectId.value;
    const amountCents = Math.round(parseFloat(amount || "0") * 100);
    if (!projectId || amountCents <= 0) {
      setResult({ message: "נא לבחור פרויקט ולהזין סכום." });
      return;
    }
    const res = await createPaymentIntent({
      amountCents,
      projectId,
      description: "תשלום (placeholder)",
    });
    setResult({ message: res.message });
  }

  return (
    <div className="surface-card p-6">
      <h2 className="mb-2 text-lg font-semibold text-foreground">
        שער תשלומים (placeholder)
      </h2>
      <p className="mb-4 text-sm text-primary/80">
        חיבור לשער תשלומים חיצוני (Stripe, iCount וכו׳) יופעל בהמשך. כרגע ניתן
        רק לרשום הכנסות ידנית למעלה.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-primary/80">פרויקט</label>
          <select
            name="projectId"
            className="rounded border border-secondary/40 bg-white px-3 py-2 text-sm text-foreground"
          >
            <option value="">— בחר —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-primary/80">סכום (₪)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="w-28 rounded border border-secondary/40 bg-white px-3 py-2 text-right text-sm text-foreground"
          />
        </div>
        <button type="submit" className="btn-secondary py-2 px-4 text-sm">
          שליחת תשלום (בדיקה)
        </button>
      </form>
      {result && (
        <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          {result.message}
        </p>
      )}
    </div>
  );
}
