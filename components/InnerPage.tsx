"use client";

import { ButtonLink } from "@/components/Button";
import { useI18n } from "@/lib/i18n";
import { siteConfig, type PageId } from "@/lib/site";

const legalPages = [
  { id: "terms", href: "/termos" },
  { id: "privacy", href: "/privacidade" },
  { id: "cookies", href: "/cookies" },
] as const;

export function InnerPage({ page }: { page: PageId }) {
  const { t } = useI18n();
  const data = t.pages[page];

  return (
    <main id="conteudo" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-bright">
          {data.kicker}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {data.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-soft">{data.lead}</p>
        {data.updated ? <p className="mt-3 text-sm text-muted">{data.updated}</p> : null}
        {data.sections?.length ? (
          <div className="mt-10 space-y-8">
            {data.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-soft">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
        {data.points.length ? (
        <ol className="mt-10 space-y-3">
          {data.points.map((point, index) => (
            <li
              key={point}
              className="flex gap-4 rounded-2xl border border-white/10 bg-card px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <span className="text-sm font-semibold text-accent-bright">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-soft">{point}</span>
            </li>
          ))}
        </ol>
        ) : null}
        {data.action ? (
          <ButtonLink href={data.action.href} variant="secondary" className="mt-8 w-full sm:w-auto">
            {data.action.label}
          </ButtonLink>
        ) : null}
        {legalPages.some((item) => item.id === page) ? (
          <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2">
            {legalPages
              .filter((item) => item.id !== page)
              .map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent-bright"
                >
                  {t.links[item.id]}
                </a>
              ))}
          </nav>
        ) : null}
        <p className="mt-8 text-sm text-muted">
          {t.supportLabel}{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-accent-bright"
          >
            {siteConfig.email}
          </a>
        </p>
      </div>
    </main>
  );
}

export function NotFoundView() {
  const { t } = useI18n();

  return (
    <main id="conteudo" className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 py-32">
      <p className="text-sm font-semibold tracking-[0.18em] text-accent-bright">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{t.notFound.title}</h1>
      <p className="mt-4 text-muted">{t.notFound.text}</p>
      <ButtonLink href="/" className="mt-8 w-full sm:w-auto">
        {t.notFound.action}
      </ButtonLink>
    </main>
  );
}
