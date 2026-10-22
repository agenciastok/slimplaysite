import type { Metadata } from "next";
import { ActivationCheckout } from "@/components/ActivationCheckout";

export const metadata: Metadata = {
  title: "Ativação",
  description:
    "Ative o Slim Play no seu dispositivo. A licença libera o player, sem conteúdos ou playlists inclusos.",
};

export default function AtivacaoPage() {
  return <ActivationCheckout />;
}
