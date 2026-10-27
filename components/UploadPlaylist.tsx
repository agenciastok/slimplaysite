"use client";

import { useId, useState, type FormEvent } from "react";
import { MacInput } from "@/components/MacInput";
import { TurnstileField } from "@/components/TurnstileField";
import { useI18n } from "@/lib/i18n";
import { maskMac, maskMacOrOtp } from "@/lib/mac";

type Tab = "code" | "url" | "xtream";
type UploadError = keyof ReturnType<typeof useI18n>["t"]["uploadForm"]["errors"];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors placeholder:text-muted focus:border-white/40";

export function UploadPlaylist() {
  const { t } = useI18n();
  const copy = t.uploadForm;
  const formId = useId();
  const [tab, setTab] = useState<Tab>("url");
  const [device, setDevice] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [m3uUrl, setM3uUrl] = useState("");
  const [epgUrl, setEpgUrl] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [protect, setProtect] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab,
          device,
          shortCode,
          playlistName,
          m3uUrl,
          epgUrl,
          serverUrl,
          username,
          password,
          protect,
          pin,
          confirmPin,
          token,
        }),
      });
      const data = (await response.json().catch(() => null)) as { error?: UploadError; ok?: boolean } | null;
      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "save");
        setResetKey((value) => value + 1);
        return;
      }
      setSuccess(true);
      setPassword("");
      setPin("");
      setConfirmPin("");
      setResetKey((value) => value + 1);
    } catch {
      setError("save");
    } finally {
      setSaving(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "code", label: copy.tabs.code },
    { id: "url", label: copy.tabs.url },
    { id: "xtream", label: copy.tabs.xtream },
  ];

  return (
    <main id="conteudo" className="px-5 pt-28 pb-20 sm:px-8">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-center text-base leading-relaxed text-soft">
          {copy.subtitle}
        </p>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-muted">
          {copy.disclaimer}
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 rounded-3xl border border-white/10 bg-[#161616]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-7"
        >
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label={copy.title}>
            {tabs.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setTab(item.id);
                    setDevice((current) => (item.id === "code" ? maskMacOrOtp(current) : maskMac(current)));
                    setError(null);
                  }}
                  className={
                    active
                      ? "rounded-full bg-white px-3 py-2.5 text-sm font-semibold text-[#161616]"
                      : "rounded-full border border-white/10 px-3 py-2.5 text-sm text-muted transition-colors hover:border-white/30 hover:text-white"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-soft">
                {tab === "code" ? copy.device : copy.mac}
              </span>
              <MacInput
                value={device}
                onChange={setDevice}
                allowOtp={tab === "code"}
                placeholder={tab === "code" ? copy.devicePlaceholder : copy.macPlaceholder}
                autoComplete="off"
                className={inputClass}
                required
              />
            </label>

            {tab === "code" ? (
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.shortCode}</span>
                <input
                  value={shortCode}
                  onChange={(event) => setShortCode(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className={inputClass}
                  required
                />
              </label>
            ) : null}

            {tab !== "code" ? (
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.playlistName}</span>
                <input
                  value={playlistName}
                  onChange={(event) => setPlaylistName(event.target.value)}
                  placeholder={copy.playlistNamePlaceholder}
                  maxLength={80}
                  className={inputClass}
                  required
                />
              </label>
            ) : null}

            {tab === "url" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm text-soft">{copy.m3uUrl}</span>
                  <input
                    value={m3uUrl}
                    onChange={(event) => setM3uUrl(event.target.value)}
                    placeholder="https://"
                    autoComplete="off"
                    spellCheck={false}
                    className={inputClass}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-soft">{copy.epgUrl}</span>
                  <input
                    value={epgUrl}
                    onChange={(event) => setEpgUrl(event.target.value)}
                    placeholder="https://"
                    autoComplete="off"
                    spellCheck={false}
                    className={inputClass}
                  />
                </label>
              </>
            ) : null}

            {tab === "xtream" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm text-soft">{copy.serverUrl}</span>
                  <input
                    value={serverUrl}
                    onChange={(event) => setServerUrl(event.target.value)}
                    placeholder="http://"
                    autoComplete="off"
                    spellCheck={false}
                    className={inputClass}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-soft">{copy.username}</span>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className={inputClass}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-soft">{copy.password}</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    className={inputClass}
                    required
                  />
                </label>
              </>
            ) : null}
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm text-soft">
            <input
              type="checkbox"
              checked={protect}
              onChange={(event) => {
                setProtect(event.target.checked);
                if (!event.target.checked) {
                  setPin("");
                  setConfirmPin("");
                }
              }}
              className="h-4 w-4 accent-[#e50914]"
            />
            {copy.protect}
          </label>

          {protect ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.setPin}</span>
                <input
                  value={pin}
                  onChange={(event) => setPin(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  className={inputClass}
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-soft">{copy.confirmPin}</span>
                <input
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  className={inputClass}
                  required
                />
              </label>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-soft">{copy.captcha}</p>
            <div className="mt-4">
              <TurnstileField action="upload" onToken={setToken} resetKey={resetKey} />
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
            {saving ? copy.saving : copy.submit}
          </button>
        </form>
      </div>

      {success ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 px-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${formId}-success`}
            className="notice-dialog w-full max-w-md rounded-3xl border border-white/10 bg-[#161616] p-8 text-center"
          >
            <h2 id={`${formId}-success`} className="text-2xl font-semibold text-white">
              {copy.successTitle}
            </h2>
            <p className="mt-3 text-soft">{copy.successText}</p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-accent-bright"
            >
              {copy.close}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
