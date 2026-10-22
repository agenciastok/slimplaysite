export const creditPacks = [
  { credits: 10, priceCents: 10_000 },
  { credits: 30, priceCents: 24_000 },
  { credits: 50, priceCents: 35_000 },
  { credits: 100, priceCents: 60_000 },
  { credits: 1000, priceCents: 500_000 },
] as const;

export type ResellerError =
  | "credentials"
  | "captcha"
  | "session"
  | "credits"
  | "mac"
  | "device"
  | "email"
  | "name"
  | "phone"
  | "password"
  | "save"
  | "config";

export type ResellerDashboard = {
  name: string;
  email: string;
  credits: number;
  total: number;
  today: number;
  month: number;
  resellers: number;
  spent: number;
};

export type ResellerDevice = {
  id: number;
  mac: string;
  comment: string;
  expiresAt: string;
  packageLabel: string;
};

export type ResellerAccount = {
  id: string;
  name: string;
  email: string;
  phone: string;
  credits: number;
};
