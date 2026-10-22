import type { Metadata } from "next";
import { InnerPage } from "@/components/InnerPage";

export const metadata: Metadata = {
  title: "Fire TV",
  description:
    "Como instalar o Slim Play no Fire TV. A instalação libera o player e não inclui lista de conteúdo.",
};

export default function FirestickPage() {
  return <InnerPage page="firestick" />;
}
