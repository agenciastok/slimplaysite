export type ActivationPlan = {
  code: string;
  days: number;
  priceCents: number;
};

export type ActivationBilling = "pix";

export type ActivationError =
  | "mac"
  | "unknown"
  | "voucher"
  | "captcha"
  | "save"
  | "unavailable"
  | "config";

export type ActivationPayment = {
  id: string;
  status: "pending" | "paid" | "refunded" | "cancelled";
  amountCents: number;
  createdAt: string;
};

export type ActivationCharge = {
  id: string;
  mac: string;
  billingType: ActivationBilling;
  status: ActivationPayment["status"];
  amountCents: number;
  days: number;
  pixPayload: string;
  pixQr: string;
  pixExpiresAt: string;
  history: ActivationPayment[];
};

export const previewPlans: ActivationPlan[] = [{ code: "365", days: 365, priceCents: 1200 }];
