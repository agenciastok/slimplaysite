import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeviceLogin } from "@/components/DeviceLogin";
import { callManage, deviceCookieName } from "@/lib/manage-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre com o MAC e a chave do dispositivo para gerenciar as listas do Slim Play.",
};

export default async function LoginPage() {
  const jar = await cookies();
  const session = jar.get(deviceCookieName())?.value ?? "";
  if (session) {
    const { data } = await callManage({ action: "session" }, session);
    if (data.ok) redirect("/gerenciar");
  }
  return <DeviceLogin />;
}
