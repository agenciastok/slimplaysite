"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { MacInput } from "@/components/MacInput";
import { TurnstileField } from "@/components/TurnstileField";
import { useI18n } from "@/lib/i18n";
import { previewPlans, type ActivationCharge, type ActivationError, type ActivationPayment, type ActivationPlan } from "@/lib/activation";
import { siteConfig } from "@/lib/site";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center font-mono text-xs break-all text-white";

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(cents / 100);
}

function remaining(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "00:00";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${hours}h ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ActivationCheckout() {
  const { t, locale } = useI18n();
  const copy = t.activationCheckout;
  const page = t.pages.activation;
  const [plans, setPlans] = useState<ActivationPlan[]>(previewPlans);
  const [ready, setReady] = useState(false);
  const [mac, setMac] = useState("");
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<ActivationError | null>(null);
  const [saving, setSaving] = useState(false);
  const [charge, setCharge] = useState<ActivationCharge | null>(null);
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/activation/plans", { cache: "no-store" });
        const data = (await response.json()) as { configured?: boolean; plans?: ActivationPlan[] };
        if (!active) return;
        const next = Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : previewPlans;
        setPlans(next);
        setReady(Boolean(data.configured && next.length > 0 && next[0].priceCents === 1200));
      } catch {
        if (active) setReady(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!charge || charge.status !== "pending") return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    const poll = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/activation/status?id=${charge.id}`, { cache: "no-store" });
        const data = (await response.json()) as Partial<ActivationCharge> & { history?: ActivationPayment[] };
        if (!data.status) return;
        setCharge((current) =>
          current
            ? {
                ...current,
                status: data.status ?? current.status,
                pixPayload: data.pixPayload ?? current.pixPayload,
                pixQr: data.pixQr ?? current.pixQr,
                history: data.history ?? current.history,
              }
            : current,
        );
      } catch {
        return;
      }
    }, 4000);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(poll);
    };
  }, [charge?.id, charge?.status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || saving) return;
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/activation/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac, token }),
      });
      const data = (await response.json().catch(() => null)) as (ActivationCharge & { error?: ActivationError }) | null;
      if (!response.ok || !data?.id) {
        setError(data?.error ?? "save");
        setResetKey((value) => value + 1);
        return;
      }
      setCharge({
        ...data,
        mac: data.mac || mac.trim().toUpperCase(),
        history: [{ id: data.id, status: data.status, amountCents: data.amountCents, createdAt: new Date().toISOString() }],
      });
    } catch {
      setError("save");
    } finally {
      setSaving(false);
    }
  }

  async function copyPix() {
    if (!charge?.pixPayload) return;
    try {
      await navigator.clipboard.writeText(charge.pixPayload);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const price = plans[0]?.priceCents ?? 1200;
  const qr = charge?.pixQr?.replace(/^data:image\/[a-z+]+;base64,/i, "") ?? "";
  const countdown = charge?.pixExpiresAt ? remaining(charge.pixExpiresAt) : "";
  void clock;

  return (
    <main id="conteudo" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-bright">{page.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{page.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-soft">{page.lead}</p>
        <ol className="mt-10 space-y-3">
          {page.points.map((point, index) => (
            <li key={point} className="flex gap-4 rounded-2xl border border-white/10 bg-card px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span className="text-sm font-semibold text-accent-bright">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-soft">{point}</span>
            </li>
          ))}
        </ol>

        {charge?.status === "paid" ? (
          <p role="status" className="mt-8 rounded-2xl border border-white/10 bg-card px-5 py-4 text-soft">{copy.paid}</p>
        ) : charge ? (
          <section className="mx-auto mt-8 max-w-md rounded-3xl border border-white/10 bg-[#101010] px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-8">
            <Logo className="mx-auto h-16 w-16" />
            <h2 className="mt-4 text-2xl font-semibold text-white">{copy.payTitle}</h2>
            <p className="mt-3 text-4xl font-semibold text-white">{money(charge.amountCents || price, locale)}</p>
            {countdown ? <p className="mt-2 text-sm text-soft">{copy.expires.replace("{time}", countdown)}</p> : null}
            {charge.status === "refunded" ? <p className="mt-4 text-sm text-accent-bright">{copy.refunded}</p> : null}
            {qr ? (
              <img src={`data:image/png;base64,${qr}`} alt={copy.pixCode} className="mx-auto mt-6 h-56 w-56 rounded-2xl bg-white p-3" />
            ) : null}
            {charge.pixPayload ? (
              <p className={`${inputClass} mt-5 px-3 py-3`}>{charge.pixPayload}</p>
            ) : null}
            <button
              type="button"
              onClick={() => void copyPix()}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-bright"
            >
              {copied ? copy.copied : copy.copy}
            </button>
            <p className="mt-5 text-sm leading-relaxed text-soft">
              {copy.released}
              <span className="mt-1 block font-semibold text-white">{charge.mac}</span>
            </p>
            <button
              type="button"
              onClick={() => setHistoryOpen((open) => !open)}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              {copy.history}
            </button>
            {historyOpen ? (
              <div className="mt-4 text-left">
                <h3 className="text-sm font-semibold text-white">{copy.historyTitle}</h3>
                {charge.history.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">{copy.emptyHistory}</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {charge.history.map((item) => (
                      <li key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
                        <span className="text-soft">{copy.statuses[item.status]}</span>
                        <span className="text-white">{money(item.amountCents, locale)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-left">
              <h3 className="text-sm font-semibold text-white">{copy.supportTitle}</h3>
              <p className="mt-2 text-sm text-soft">
                {copy.supportLead}{" "}
                <a href={siteConfig.telegramUrl} target="_blank" rel="noreferrer" className="font-semibold text-white underline decoration-white/30 underline-offset-4">
                  Telegram
                </a>
              </p>
              <p className="mt-3 text-sm text-accent-bright">{copy.attention}</p>
            </div>
          </section>
        ) : (
          <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-md rounded-3xl border border-white/10 bg-[#161616]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7">
            <p className="text-sm leading-relaxed text-muted">{copy.notice}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{money(price, locale)}</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm text-soft">{copy.mac}</span>
              <MacInput
                value={mac}
                onChange={setMac}
                placeholder="AA:BB:CC:DD:EE:FF"
                autoComplete="off"
                disabled={!ready}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                required
              />
            </label>
            {ready ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-soft">{t.uploadForm.captcha}</p>
                <div className="mt-4">
                  <TurnstileField action="activation" onToken={setToken} resetKey={resetKey} />
                </div>
              </div>
            ) : null}
            {error ? <p role="alert" className="mt-4 text-sm text-accent-bright">{copy.errors[error] ?? copy.errors.save}</p> : null}
            <button
              type="submit"
              disabled={!ready || saving || !token}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)] hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? copy.paying : copy.pay}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
