"use client";

import { ButtonLink } from "@/components/Button";
import { useI18n } from "@/lib/i18n";
import { siteConfig, type PageId } from "@/lib/site";

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
        {data.action ? (
          <ButtonLink href={data.action.href} variant="secondary" className="mt-8 w-full sm:w-auto">
            {data.action.label}
          </ButtonLink>
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
