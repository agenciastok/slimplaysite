"use client";

import { useI18n } from "@/lib/i18n";

export function Features() {
  const { t } = useI18n();

  return (
    <section className="px-5 pb-16 sm:px-8">
      <ul className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
        {t.features.items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-white/10 bg-card px-6 py-7 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-white/25"
          >
            <h2 className="text-lg font-semibold tracking-tight text-white">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
