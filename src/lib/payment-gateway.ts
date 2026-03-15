import type { ProjectId } from "./projects";

/**
 * Placeholder for future external payment API (e.g. Stripe, iCount, Morning).
 * All functions return success with placeholder flags; no real charges.
 */

export type PaymentIntent = {
  success: boolean;
  placeholder: true;
  message: string;
  /** For future: external transaction id */
  externalId?: string;
};

export type CreatePaymentParams = {
  amountCents: number;
  projectId: ProjectId;
  description?: string;
  /** Optional metadata for reconciliation */
  metadata?: Record<string, string>;
};

/**
 * Create a payment intent (donation/payment toward a project).
 * Ready for replacement with real gateway (Stripe, etc.).
 */
export async function createPaymentIntent(
  params: CreatePaymentParams
): Promise<PaymentIntent> {
  // Placeholder: no external API call
  return {
    success: true,
    placeholder: true,
    message: "תשלום לא מחובר כרגע. בעתיד יתווסף חיבור לשער תשלומים חיצוני.",
  };
}

/**
 * Confirm a payment (e.g. after 3D Secure or redirect).
 * Placeholder for future webhook or callback handling.
 */
export async function confirmPayment(intentId: string): Promise<PaymentIntent> {
  return {
    success: true,
    placeholder: true,
    message: "אישור תשלום – לא מחובר (placeholder).",
  };
}
