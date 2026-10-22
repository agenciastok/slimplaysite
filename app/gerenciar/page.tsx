import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ListManager } from "@/components/ListManager";
import { callManage, deviceCookieName } from "@/lib/manage-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload de Lista",
  description: "Adicione, altere ou exclua as listas vinculadas ao seu dispositivo Slim Play.",
};

export default async function ManageListsPage() {
  const jar = await cookies();
  const session = jar.get(deviceCookieName())?.value ?? "";
  if (!session) redirect("/login");

  const { data } = await callManage({ action: "lists" }, session);
  if (!data.ok || !data.mac) redirect("/login");

  return <ListManager mac={data.mac} initialLists={data.lists ?? []} />;
}
