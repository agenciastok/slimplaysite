import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com o Slim Play por e-mail, Telegram ou pelo formulário. O suporte cobre o aplicativo, não listas ou conteúdos de terceiros.",
};

export default function ContactPage() {
  return <ContactForm />;
}
