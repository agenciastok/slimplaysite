import type { Metadata } from "next";
import { InnerPage } from "@/components/InnerPage";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Quais dados o Slim Play trata para licença, listas e revenda, com quem eles são compartilhados e como exercer os seus direitos.",
};

export default function PrivacidadePage() {
  return <InnerPage page="privacy" />;
}
