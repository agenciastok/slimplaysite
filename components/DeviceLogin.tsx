"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TurnstileField } from "@/components/TurnstileField";
import { useI18n } from "@/lib/i18n";
import type { ManageError } from "@/lib/managed-list";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors placeholder:text-muted focus:border-white/40";

export function DeviceLogin() {
  const { t } = useI18n();
  const copy = t.manage;
  const form = t.uploadForm;
  const router = useRouter();
  const [mac, setMac] = useState("");
  const [deviceKey, setDeviceKey] = useState("");
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<ManageError | null>(null);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/manage/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mac, deviceKey, token }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: ManageError } | null;
      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "credentials");
        setResetKey((value) => value + 1);
        return;
      }
      router.replace("/gerenciar");
      router.refresh();
    } catch {
      setError("save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main id="conteudo" className="px-5 pt-28 pb-20 sm:px-8">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">{copy.loginTitle}</h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base leading-relaxed text-soft">{copy.loginSubtitle}</p>
        <form
          onSubmit={onSubmit}
          className="mt-10 rounded-3xl border border-white/10 bg-[#161616]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-soft">{copy.mac}</span>
              <input
                value={mac}
                onChange={(event) => setMac(event.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
                autoComplete="off"
                spellCheck={false}
                className={inputClass}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm text-soft">
                {copy.deviceKey}
                <button
                  type="button"
                  onClick={() => setShowKey((value) => !value)}
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-white"
                >
                  {showKey ? copy.hide : copy.show}
                </button>
              </span>
              <input
                value={deviceKey}
                onChange={(event) => setDeviceKey(event.target.value)}
                type={showKey ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                maxLength={6}
                className={inputClass}
                required
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-soft">{form.captcha}</p>
            <div className="mt-4">
              <TurnstileField action="login" onToken={setToken} resetKey={resetKey} />
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
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)] transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? copy.entering : copy.enter}
          </button>
        </form>
      </div>
    </main>
  );
}
