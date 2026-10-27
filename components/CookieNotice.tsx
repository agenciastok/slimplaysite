"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "slimplay-cookies";

export function CookieNotice() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-white/10 bg-[#161616] p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)] sm:flex-row sm:items-center">
        <p className="text-sm leading-relaxed text-soft">
          {t.cookieNotice.text}{" "}
          <a href="/cookies" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent-bright">
            {t.cookieNotice.policy}
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              /* The notice can still close for this view. */
            }
            setOpen(false);
          }}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-accent px-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-accent-bright"
        >
          {t.cookieNotice.action}
        </button>
      </div>
    </div>
  );
}
