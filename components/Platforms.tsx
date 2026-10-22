"use client";

import Link from "next/link";
import { PlatformMark } from "@/components/PlatformMarks";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { platformHrefs } from "@/lib/site";

export function Platforms() {
  const { t } = useI18n();

  return (
    <section className="px-5 py-16 sm:px-8" aria-labelledby="plataformas-titulo">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <h2
            id="plataformas-titulo"
            className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-wide text-accent-bright"
          >
            <span className="h-px w-5 bg-current" aria-hidden="true" />
            {t.platforms.badge}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">{t.platforms.subtitle}</p>
        </header>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {t.platforms.items.map((item) => {
            const href = platformHrefs[item.id];
            const linked = item.status !== "review" && href;
            const action = item.status === "use" ? t.platforms.use : t.platforms.install;
            const className = cn(
              "flex h-full flex-col items-center rounded-2xl border border-white/10 bg-card px-3 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
              linked
                ? "cursor-pointer transition-colors duration-200 hover:border-[#3DDC97]/45"
                : "cursor-default",
            );
            const body = (
              <>
                <span className="grid h-9 place-items-center text-white">
                  <PlatformMark id={item.id} />
                </span>
                <span className="mt-3 text-sm leading-snug font-medium text-white">{item.name}</span>
                {linked ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#3DDC97]">
                    {action}
                    <span aria-hidden="true">↗</span>
                  </span>
                ) : (
                  <span className="mt-2 inline-flex rounded-full bg-[#e0a84a]/12 px-2 py-0.5 text-[11px] font-medium text-[#e0a84a]">
                    {t.platforms.review}
                  </span>
                )}
              </>
            );

            return (
              <li key={item.id}>
                {linked ? (
                  <Link href={href} className={className}>
                    {body}
                  </Link>
                ) : (
                  <div className={className}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
