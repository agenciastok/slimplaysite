import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { NoticeModal } from "@/components/NoticeModal";
import { Platforms } from "@/components/Platforms";
import { Resources } from "@/components/Resources";

export default function HomePage() {
  return (
    <main id="conteudo">
      <NoticeModal />
      <Hero />
      <Features />
      <Resources />
      <Platforms />
      <Faq />
    </main>
  );
}
