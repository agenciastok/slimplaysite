"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CheckIcon, CloseIcon, QuestionIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const NOTICE_KEY = "slimplay-notice";

const tones = {
  is: {
    border: "border-[#3DDC97]/55",
    wash: "bg-[#3DDC97]/[0.06]",
    ink: "text-[#3DDC97]",
    marker: "marker:text-[#3DDC97]",
    Icon: CheckIcon,
  },
  isNot: {
    border: "border-accent-bright/70",
    wash: "bg-accent/[0.08]",
    ink: "text-accent-bright",
    marker: "marker:text-accent-bright",
    Icon: CloseIcon,
  },
  how: {
    border: "border-[#5BA8FF]/60",
    wash: "bg-[#5BA8FF]/[0.07]",
    ink: "text-[#5BA8FF]",
    marker: "marker:text-[#5BA8FF]",
    Icon: QuestionIcon,
  },
} as const;

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function NoticeModal() {
  const { t } = useI18n();
  const titleId = useId();
  const subtitleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(NOTICE_KEY) === "1") return;
    } catch {
      /* Sem armazenamento: o aviso ainda aparece nesta visita. */
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])")];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [open]);

  function dismiss() {
    try {
      localStorage.setItem(NOTICE_KEY, "1");
    } catch {
      /* O aviso fecha mesmo se o navegador bloquear o armazenamento. */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
        tabIndex={-1}
        className="notice-dialog relative flex max-h-[min(92vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161616] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <header className="relative shrink-0 px-6 pt-6 pb-2 text-center sm:px-8">
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.notice.close}
            className="absolute top-3 right-3 grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
          <Logo className="mx-auto h-14 w-14" />
          <h2 id={titleId} className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            {t.notice.title}
          </h2>
          <p id={subtitleId} className="mt-2 text-sm leading-relaxed text-muted">
            {t.notice.subtitle}
          </p>
        </header>

        <div className="notice-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 sm:px-8">
          <div className="grid gap-3">
            {t.notice.blocks.map((block) => {
              const tone = tones[block.id];
              const numbered = block.id === "how";
              const ListTag = numbered ? "ol" : "ul";
              return (
                <section key={block.id} className={cn("rounded-xl border px-4 py-4", tone.border, tone.wash)}>
                  <h3 className="flex items-center gap-2.5 text-base font-semibold text-white">
                    <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-black/25", tone.border, tone.ink)}>
                      <tone.Icon className="h-3.5 w-3.5" />
                    </span>
                    {block.title}
                  </h3>
                  <ListTag
                    className={cn(
                      "mt-3 space-y-2 pl-5 text-sm leading-relaxed text-soft",
                      numbered ? "list-decimal" : "list-disc",
                      tone.marker,
                      "marker:font-semibold",
                    )}
                  >
                    {block.items.map((item) => (
                      <li key={item}>
                        <RichText text={item} />
                      </li>
                    ))}
                  </ListTag>
                </section>
              );
            })}
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-soft italic">
            {t.notice.summary}
          </p>
        </div>

        <footer className="shrink-0 border-t border-white/10 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-[13px] font-semibold tracking-[0.08em] text-white uppercase shadow-[0_10px_30px_rgba(229,9,20,0.35)] transition-colors hover:bg-accent-bright"
          >
            {t.notice.confirm}
          </button>
        </footer>
      </div>
    </div>
  );
}
