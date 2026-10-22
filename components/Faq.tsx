"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/Icons";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { FaqId } from "@/lib/site";

export function Faq() {
  const { t } = useI18n();
  const [openId, setOpenId] = useState<FaqId | null>(null);

  return (
    <section className="px-5 pt-16 pb-24 sm:px-8" aria-labelledby="duvidas-titulo">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="inline-flex rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-soft">
            {t.faq.badge}
          </p>
          <h2 id="duvidas-titulo" className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            {t.faq.title}
          </h2>
        </header>
        <ul className="mt-10 grid gap-3">
          {t.faq.items.map((item) => {
            const open = openId === item.id;
            const panelId = `faq-${item.id}`;
            return (
              <li
                key={item.id}
                className="rounded-2xl border border-white/10 bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-white/25"
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-base font-medium tracking-tight text-white">{item.question}</span>
                    <ChevronIcon
                      className={cn("h-5 w-5 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")}
                    />
                  </button>
                </h3>
                <div id={panelId} role="region" hidden={!open} className="px-5 pb-5">
                  <p className="text-sm leading-relaxed text-muted">{item.answer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
