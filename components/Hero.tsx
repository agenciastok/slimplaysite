"use client";

import { ButtonLink } from "@/components/Button";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="px-5 pt-32 pb-14 sm:px-8 sm:pt-40">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-white sm:text-6xl">
          {t.hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-soft sm:text-lg">
          {t.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/ativacao" className="w-full sm:w-auto">
            {t.hero.primary}
          </ButtonLink>
          <ButtonLink href="/upload" variant="secondary" className="w-full sm:w-auto">
            {t.hero.secondary}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
