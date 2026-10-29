"use client";

import { useState, type FormEvent } from "react";
import { MailIcon, TelegramIcon } from "@/components/Icons";
import { TurnstileField } from "@/components/TurnstileField";
import { useI18n } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors placeholder:text-muted focus:border-white/40";

type ContactError = "name" | "email" | "message" | "captcha" | "save";

export function ContactForm() {
  const { t } = useI18n();
  const copy = t.contact;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<ContactError | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, token }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: ContactError } | null;
      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "save");
        setResetKey((value) => value + 1);
        return;
      }
      setSent(true);
    } catch {
      setError("save");
      setResetKey((value) => value + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main id="conteudo" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-5 pt-32 pb-24 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-bright">{copy.kicker}</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{copy.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-soft">{copy.lead}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="space-y-4">
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#161616]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/25"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30 text-white">
                <MailIcon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{copy.emailLabel}</span>
                <span className="mt-1 block break-all text-sm text-white">{siteConfig.email}</span>
              </span>
            </a>
            <a
              href={siteConfig.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#161616]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/25"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-black/30 text-white">
                <TelegramIcon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{copy.telegramLabel}</span>
                <span className="mt-1 block text-sm text-white">{copy.telegramText}</span>
              </span>
            </a>
          </div>

          <section className="rounded-3xl border border-white/10 bg-[#161616]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
            {sent ? (
              <div role="status">
                <h2 className="text-2xl font-semibold text-white">{copy.successTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-soft">{copy.successText}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <h2 className="text-xl font-semibold text-white">{copy.formTitle}</h2>
                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-soft">{copy.name}</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      minLength={2}
                      maxLength={80}
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-soft">{copy.email}</span>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      autoComplete="email"
                      maxLength={160}
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm text-soft">{copy.message}</span>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={copy.messagePlaceholder}
                      rows={5}
                      minLength={10}
                      maxLength={2000}
                      className={`${inputClass} resize-y`}
                      required
                    />
                  </label>
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-sm text-soft">{copy.captcha}</p>
                  <div className="mt-4">
                    <TurnstileField action="contact" onToken={setToken} resetKey={resetKey} />
                  </div>
                </div>
                {error ? (
                  <p role="alert" className="mt-4 text-sm text-accent-bright">
                    {copy.errors[error] ?? copy.errors.save}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={saving || !token}
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)] transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? copy.sending : copy.submit}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
