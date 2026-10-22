import type { Metadata } from "next";
import { InnerPage } from "@/components/InnerPage";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "O site do Slim Play guarda a preferência de idioma neste navegador e usa o e-mail apenas para suporte.",
};

export default function PrivacidadePage() {
  return <InnerPage page="privacy" />;
}
