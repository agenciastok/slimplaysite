import type { Metadata } from "next";
import { InnerPage } from "@/components/InnerPage";

export const metadata: Metadata = {
  title: "Chromecast",
  description:
    "Como usar o Slim Play no Chromecast. O app reproduz a lista que você já tem e não fornece conteúdo.",
};

export default function ChromecastPage() {
  return <InnerPage page="chromecast" />;
}
