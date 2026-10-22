"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { previewPlans, type ActivationBilling, type ActivationCharge, type ActivationError, type ActivationPlan } from "@/lib/activation";
import { siteConfig } from "@/lib/site";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors placeholder:text-muted focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-60";

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function ActivationCheckout() {
  const { t, locale } = useI18n();
  const copy = t.activationCheckout;
  const page = t.pages.activation;
  const formId = useId();
  const [plans, setPlans] = useState<ActivationPlan[]>(previewPlans);
  const [ready, setReady] = useState(false);
  const [plan, setPlan] = useState("30");
  const [billing, setBilling] = useState<ActivationBilling>("pix");
  const [mac, setMac] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<ActivationError | null>(null);
  const [saving, setSaving] = useState(false);
  const [charge, setCharge] = useState<ActivationCharge | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadCaptcha() {
    setAnswer("");
    try {
      const response = await fetch("/api/activation/captcha", { cache: "no-store" });
      const data = (await response.json()) as { question?: string; token?: string; error?: ActivationError };
      if (!response.ok || !data.question || !data.token) {
        setError(data.error ?? "unavailable");
        return;
      }
      setQuestion(data.question);
      setToken(data.token);
    } catch {
      setError("config");
    }
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/activation/plans", { cache: "no-store" });
        const data = (await response.json()) as { configured?: boolean; plans?: ActivationPlan[] };
        if (!active) return;
        const next = Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : previewPlans;
        setPlans(next);
        setPlan(next[0]?.code ?? "30");
        const open = Boolean(data.configured && data.plans && data.plans.length > 0);
        setReady(open);
        if (open) void loadCaptcha();
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
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/activation/status?id=${charge.id}`, { cache: "no-store" });
        const data = (await response.json()) as { status?: ActivationCharge["status"] };
        if (data.status === "paid" || data.status === "refunded" || data.status === "cancelled") {
          setCharge((current) => (current ? { ...current, status: data.status ?? current.status } : current));
        }
      } catch {
        return;
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [charge]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || saving) return;
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/activation/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac, name, email, cpf, plan, billing, token, answer }),
      });
      const data = (await response.json().catch(() => null)) as (ActivationCharge & { error?: ActivationError }) | null;
      if (!response.ok || !data?.id) {
        setError(data?.error ?? "save");
        void loadCaptcha();
        return;
      }
      setCharge(data);
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

  const qr = charge?.pixQr?.replace(/^data:image\/[a-z+]+;base64,/i, "") ?? "";

  return (
    <main id="conteudo" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-bright">{page.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{page.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-soft">{page.lead}</p>
        <ol className="mt-10 space-y-3">
          {page.points.map((point, index) => (
            <li
              key={point}
              className="flex gap-4 rounded-2xl border border-white/10 bg-card px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <span className="text-sm font-semibold text-accent-bright">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-soft">{point}</span>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm leading-relaxed text-muted">{copy.notice}</p>

        {charge?.status === "paid" ? (
          <p role="status" className="mt-6 rounded-2xl border border-white/10 bg-card px-5 py-4 text-soft">
            {copy.paid}
          </p>
        ) : charge ? (
          <section className="mt-6 rounded-3xl border border-white/10 bg-[#161616]/80 p-5 sm:p-7">
            <p className="text-sm text-soft">{charge.status === "refunded" ? copy.refunded : copy.waiting}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{money(charge.amountCents, locale)}</p>
            {charge.billingType === "pix" && qr ? (
              <div className="mt-6">
                <img
                  src={`data:image/png;base64,${qr}`}
                  alt={copy.pix}
                  className="mx-auto h-56 w-56 rounded-2xl bg-white p-3"
                />
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm text-soft">{copy.pixCode}</span>
                  <input readOnly value={charge.pixPayload} className={inputClass} />
                </label>
                <button
                  type="button"
                  onClick={() => void copyPix()}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/75 px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white hover:border-accent-bright"
                >
                  {copied ? copy.copied : copy.copy}
                </button>
              </div>
            ) : null}
            {charge.billingType === "credit_card" && charge.invoiceUrl ? (
              <a
                href={charge.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-accent-bright"
              >
                {copy.card}
              </a>
            ) : null}
          </section>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-6 rounded-3xl border border-white/10 bg-[#161616]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7"
          >
            <fieldset disabled={!ready} className="space-y-4">
              <legend className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">{copy.plan}</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {plans.map((item) => (
                  <label
                    key={item.code}
                    className={`cursor-pointer rounded-2xl border px-4 py-4 ${plan === item.code ? "border-accent-bright" : "border-white/10"}`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={item.code}
                      checked={plan === item.code}
                      onChange={() => setPlan(item.code)}
                      className="sr-only"
                    />
                    <span className="block text-sm text-white">{copy.days.replace("{days}", String(item.days))}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {item.priceCents > 0 ? money(item.priceCents, locale) : copy.priceLater}
                    </span>
                  </label>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["pix", "credit_card"] as const).map((method) => (
                  <label
                    key={method}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm text-white ${billing === method ? "border-accent-bright" : "border-white/10"}`}
                  >
                    <input
                      type="radio"
                      name="billing"
                      value={method}
                      checked={billing === method}
                      onChange={() => setBilling(method)}
                      className="sr-only"
                    />
                    {method === "pix" ? copy.pix : copy.card}
                  </label>
                ))}
              </div>
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.mac}</span>
                <input value={mac} onChange={(event) => setMac(event.target.value)} placeholder="AA:BB:CC:DD:EE:FF" autoComplete="off" spellCheck={false} className={inputClass} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.name}</span>
                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={inputClass} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.email}</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className={inputClass} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.cpf}</span>
                <input value={cpf} onChange={(event) => setCpf(event.target.value)} inputMode="numeric" autoComplete="off" className={inputClass} required />
              </label>
            </fieldset>

            {ready ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-soft">{t.uploadForm.captcha}</p>
                  <button type="button" onClick={() => void loadCaptcha()} className="text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-white">
                    {t.uploadForm.refreshCaptcha}
                  </button>
                </div>
                <p id={`${formId}-captcha`} className="mt-4 flex justify-center gap-2 select-none">
                  {(question || "•••").split("").map((glyph, index) =>
                    glyph === " " ? (
                      <span key={`gap-${index}`} className="w-2" />
                    ) : (
                      <span
                        key={`${glyph}-${index}`}
                        className="inline-grid h-12 w-9 place-items-center rounded-lg border border-white/10 bg-[#161616] text-xl font-semibold text-white"
                        style={{ transform: `rotate(${index % 2 === 0 ? -6 : 5}deg)` }}
                      >
                        {glyph}
                      </span>
                    ),
                  )}
                </p>
                <label className="mt-4 block">
                  <span className="sr-only">{t.uploadForm.captcha}</span>
                  <input
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={t.uploadForm.captchaPlaceholder}
                    aria-describedby={`${formId}-captcha`}
                    className={inputClass}
                    required
                  />
                </label>
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="mt-4 text-sm text-accent-bright">
                {copy.errors[error] ?? copy.errors.save}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!ready || saving || !token}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)] transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? copy.paying : copy.pay}
            </button>
          </form>
        )}

        <p className="mt-8 text-sm text-muted">
          {t.supportLabel}{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent-bright">
            {siteConfig.email}
          </a>
        </p>
      </div>
    </main>
  );
}
