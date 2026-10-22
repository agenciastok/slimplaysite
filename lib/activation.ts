export type ActivationPlan = {
  code: string;
  days: number;
  priceCents: number;
};

export type ActivationBilling = "pix" | "credit_card";

export type ActivationError =
  | "mac"
  | "name"
  | "email"
  | "cpf"
  | "plan"
  | "captcha"
  | "save"
  | "unavailable"
  | "config";

export type ActivationCharge = {
  id: string;
  billingType: ActivationBilling;
  status: "pending" | "paid" | "refunded" | "cancelled";
  amountCents: number;
  days: number;
  invoiceUrl: string;
  pixPayload: string;
  pixQr: string;
};

export const previewPlans: ActivationPlan[] = [
  { code: "30", days: 30, priceCents: 0 },
  { code: "90", days: 90, priceCents: 0 },
  { code: "365", days: 365, priceCents: 0 },
];
