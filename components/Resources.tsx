"use client";

import { BoltIcon, DevicesIcon, FilmsIcon, GearIcon, ServerIcon, TvIcon } from "@/components/Icons";
import { useI18n } from "@/lib/i18n";
import type { ResourceId } from "@/lib/site";

const icons: Record<ResourceId, typeof TvIcon> = {
  live: TvIcon,
  catalog: FilmsIcon,
  playlist: ServerIcon,
  activation: BoltIcon,
  devices: DevicesIcon,
  smooth: GearIcon,
};

export function Resources() {
  const { t } = useI18n();

  return (
    <section className="px-5 py-8 sm:px-8" aria-labelledby="recursos-titulo">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-soft">
            {t.resources.badge}
          </p>
          <h2
            id="recursos-titulo"
            className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl"
          >
            {t.resources.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">{t.resources.subtitle}</p>
        </header>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.resources.items.map((item) => {
            const Icon = icons[item.id];
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-white/10 bg-card px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-white/25"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-accent-bright">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
