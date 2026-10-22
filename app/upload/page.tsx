import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { callManage, deviceCookieName } from "@/lib/manage-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload de Lista",
  description:
    "Carregue a sua lista pessoal no Slim Play. O player não hospeda, não vende e não fornece playlists.",
};

export default async function UploadPage() {
  const jar = await cookies();
  const session = jar.get(deviceCookieName())?.value ?? "";
  if (!session) redirect("/login");

  const { data } = await callManage({ action: "session" }, session);
  if (!data.ok) redirect("/login");

  redirect("/gerenciar");
}
