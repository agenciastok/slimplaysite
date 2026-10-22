"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import type { ResellerError } from "@/lib/reseller";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-white/40";

export function ResellerLogin() {
  const { t } = useI18n();
  const copy = t.resellerPanel;
  const router = useRouter();
  const formId = useId();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<ResellerError | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const signup = mode === "signup";

  async function loadCaptcha() {
    setAnswer("");
    try {
      const response = await fetch("/api/reseller/captcha", { cache: "no-store" });
      const data = (await response.json()) as { question?: string; token?: string; error?: ResellerError };
      if (!response.ok || !data.question || !data.token) {
        setError(data.error ?? "config");
        return;
      }
      setQuestion(data.question);
      setToken(data.token);
    } catch {
      setError("config");
    }
  }

  useEffect(() => {
    void loadCaptcha();
  }, []);

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setError(null);
    setMismatch(false);
    setConfirm("");
    void loadCaptcha();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (signup && password !== confirm) {
      setMismatch(true);
      setError(null);
      return;
    }
    setSaving(true);
    setError(null);
    setMismatch(false);
    try {
      const response = await fetch(signup ? "/api/reseller/register" : "/api/reseller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup ? { name, email, phone, password, token, answer } : { email, password, token, answer }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: ResellerError } | null;
      if (!response.ok || !data?.ok) {
        setError(data?.error ?? (signup ? "save" : "credentials"));
        void loadCaptcha();
        return;
      }
      router.replace("/revendedor");
      router.refresh();
    } catch {
      setError("save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main id="conteudo" className="fixed inset-0 z-[60] overflow-y-auto bg-[#101010] px-5 py-10">
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#161616] p-6 sm:p-8">
        <Logo className="mx-auto h-14 w-14" />
        <h1 className="mt-5 text-center text-3xl font-semibold text-white">{signup ? copy.signupTitle : copy.loginTitle}</h1>
        <p className="mt-2 text-center text-sm text-muted">{signup ? copy.signupSubtitle : copy.loginSubtitle}</p>
        {signup ? (
          <>
            <label className="mt-8 block">
              <span className="mb-2 block text-sm text-soft">{copy.columns.name}</span>
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className={inputClass} required />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm text-soft">{copy.phone}</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" className={inputClass} required />
            </label>
          </>
        ) : null}
        <label className={signup ? "mt-4 block" : "mt-8 block"}>
          <span className="mb-2 block text-sm text-soft">{copy.email}</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" className={inputClass} required />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-soft">{copy.password}</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} className={inputClass} required />
        </label>
        {signup ? (
          <label className="mt-4 block">
            <span className="mb-2 block text-sm text-soft">{copy.confirmPassword}</span>
            <input value={confirm} onChange={(event) => setConfirm(event.target.value)} type="password" autoComplete="new-password" minLength={8} className={inputClass} required />
          </label>
        ) : null}
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
                <span key={`${glyph}-${index}`} className="inline-grid h-12 w-9 place-items-center rounded-lg border border-white/10 bg-[#161616] text-xl font-semibold text-white" style={{ transform: `rotate(${index % 2 === 0 ? -6 : 5}deg)` }}>
                  {glyph}
                </span>
              ),
            )}
          </p>
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder={t.uploadForm.captchaPlaceholder}
            aria-describedby={`${formId}-captcha`}
            className={`${inputClass} mt-4`}
            required
          />
        </div>
        {signup ? <p className="mt-4 text-sm text-muted">{copy.signupNote}</p> : null}
        {mismatch ? <p role="alert" className="mt-4 text-sm text-accent-bright">{copy.passwordMismatch}</p> : null}
        {error ? <p role="alert" className="mt-4 text-sm text-accent-bright">{copy.errors[error] ?? copy.errors.save}</p> : null}
        <button type="submit" disabled={saving || !token} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent text-[13px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-accent-bright disabled:opacity-60">
          {saving ? (signup ? copy.signingUp : copy.entering) : signup ? copy.signup : copy.enter}
        </button>
        <button type="button" onClick={() => switchMode(signup ? "login" : "signup")} className="mt-4 block w-full text-center text-sm text-white underline decoration-white/30 underline-offset-4 hover:decoration-accent-bright">
          {signup ? copy.haveAccount : copy.needAccount}
        </button>
        <a href="/" className="mt-3 block text-center text-sm text-muted hover:text-white">{copy.home}</a>
      </form>
    </main>
  );
}
