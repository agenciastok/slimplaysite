import type { Metadata } from "next";
import { InnerPage } from "@/components/InnerPage";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "O site do Slim Play usa somente armazenamento necessário para idioma, sessão e avisos. Não há cookie de anúncio nem de análise.",
};

export default function CookiesPage() {
  return <InnerPage page="cookies" />;
}
