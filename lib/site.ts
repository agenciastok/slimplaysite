export const siteConfig = {
  name: "Slim Play",
  email: "contato@slimplay.app",
  telegramUrl: "https://t.me/slimplayapp",
  year: 2026,
} as const;

export type LinkId = "home" | "activation" | "upload" | "reseller" | "terms" | "privacy" | "cookies";

export const navItems: Array<{ href: string; id: LinkId }> = [
  { href: "/", id: "home" },
  { href: "/ativacao", id: "activation" },
  { href: "/upload", id: "upload" },
  { href: "/revendedor", id: "reseller" },
];

export const footerItems: Array<{ href: string; id: LinkId }> = [
  { href: "/", id: "home" },
  { href: "/ativacao", id: "activation" },
  { href: "/upload", id: "upload" },
  { href: "/termos", id: "terms" },
  { href: "/privacidade", id: "privacy" },
  { href: "/cookies", id: "cookies" },
];

export type PageId =
  | "activation"
  | "upload"
  | "reseller"
  | "terms"
  | "privacy"
  | "cookies"
  | "chromecast"
  | "firestick";

export type FeatureId = "interface" | "trial" | "support";

export type ResourceId = "live" | "catalog" | "playlist" | "activation" | "devices" | "smooth";

export type FaqId = "content" | "login" | "devices" | "playlist" | "reseller";

export type PlatformId =
  | "android"
  | "windows"
  | "xbox"
  | "samsung"
  | "whale"
  | "titan"
  | "lg"
  | "roku"
  | "ios"
  | "macos"
  | "chromecast"
  | "firestick";

export const platformHrefs: Partial<Record<PlatformId, string>> = {
  chromecast: "/chromecast",
  firestick: "/firestick",
};
