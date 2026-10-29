import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import { siteConfig } from "@/lib/site";

const subject = "Exclusão de Conta - Slim Play";
const description =
  "Solicite a exclusão da conta e dos dados do Slim Play. Envie um e-mail para contato@slimplay.app com o identificador da licença. O pedido é concluído em até 7 dias úteis.";

export const metadata: Metadata = {
  title: { absolute: "Solicitação de Exclusão de Conta e Dados - Slim Play" },
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: "/delete-account" },
  openGraph: {
    title: "Solicitação de Exclusão de Conta e Dados - Slim Play",
    description,
    url: "/delete-account",
    locale: "pt_BR",
    type: "website",
    siteName: "Slim Play",
  },
};

const deletedData = [
  "Registros de login e credenciais de autenticação.",
  "Histórico de ativações e dados de identificação do dispositivo.",
];

export default function DeleteAccountPage() {
  const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;

  return (
    <main id="conteudo" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-bright">Conta</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Solicitação de Exclusão de Conta e Dados - Slim Play
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-soft">
          Em conformidade com as políticas de privacidade da Google Play Store e a LGPD, os usuários do aplicativo Slim
          Play podem solicitar a exclusão de suas contas e dados associados a qualquer momento.
        </p>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white">Como solicitar a exclusão</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-soft">
              <p>
                Envie um e-mail para{" "}
                <a
                  href={mailto}
                  className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-accent-bright"
                >
                  {siteConfig.email}
                </a>{" "}
                com o assunto &quot;{subject}&quot;.
              </p>
              <p>No corpo do e-mail, informe o Nome de Usuário / Identificador da licença cadastrado no app.</p>
            </div>
            <ButtonLink href={mailto} className="mt-6 w-full sm:w-auto">
              Enviar solicitação
            </ButtonLink>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Quais dados são excluídos</h2>
            <ul className="mt-3 space-y-3">
              {deletedData.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/10 bg-card px-5 py-4 text-sm leading-relaxed text-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Prazo de processamento</h2>
            <p className="mt-3 text-sm leading-relaxed text-soft">
              A solicitação será processada e concluída em até 7 dias úteis, com confirmação enviada por e-mail.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
