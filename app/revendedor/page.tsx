import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ResellerLogin } from "@/components/ResellerLogin";
import { ResellerPanel } from "@/components/ResellerPanel";
import type { ResellerDashboard } from "@/lib/reseller";
import { callReseller, resellerCookieName } from "@/lib/reseller-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revendedor",
  description: "Painel de créditos para ativar a licença do Slim Play em um dispositivo por um ano.",
};

export default async function RevendedorPage() {
  const jar = await cookies();
  const session = jar.get(resellerCookieName())?.value ?? "";
  if (!session) return <ResellerLogin />;

  const { data } = await callReseller({ action: "dashboard" }, session);
  if (!data.ok || !data.name || !data.email) return <ResellerLogin />;

  const initial: ResellerDashboard = {
    name: data.name,
    email: data.email,
    credits: data.credits ?? 0,
    total: data.total ?? 0,
    today: data.today ?? 0,
    month: data.month ?? 0,
    resellers: data.resellers ?? 0,
    spent: data.spent ?? 0,
  };
  return <ResellerPanel initial={initial} />;
}
