import type { Metadata } from "next";
import { InnerPage } from "@/components/InnerPage";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "O Slim Play é apenas um player de mídia. Sem conteúdo pré-carregado e sem serviço de catálogo.",
};

export default function TermosPage() {
  return <InnerPage page="terms" />;
}
