"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronIcon, GlobeIcon } from "@/components/Icons";
import { locales } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = locales.find((item) => item.id === locale) ?? locales[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 text-sm text-soft transition-colors hover:border-white"
        aria-label={t.a11y.language}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <GlobeIcon className="h-4 w-4 text-muted" />
        <span className="hidden font-medium sm:inline lg:hidden">{current.short}</span>
        <span className="hidden font-medium lg:inline">{current.label}</span>
        <ChevronIcon className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t.a11y.language}
          className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-white/10 bg-card p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
        >
          {locales.map((item) => {
            const selected = item.id === locale;
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    selected ? "bg-white/[0.06] text-white" : "text-soft hover:bg-white/[0.04] hover:text-white",
                  )}
                  onClick={() => {
                    setLocale(item.id);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  {selected ? <CheckIcon className="h-4 w-4 text-accent-bright" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
