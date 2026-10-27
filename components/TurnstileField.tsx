"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loader: Promise<void> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
      const script = existing ?? document.createElement("script");
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("turnstile"));
      if (!existing) {
        script.src = SCRIPT;
        document.head.appendChild(script);
      }
    });
  }
  return loader;
}

export function TurnstileField({
  action,
  onToken,
  resetKey,
}: {
  action: string;
  onToken: (token: string) => void;
  resetKey: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    if (!sitekey || !host.current) return;
    let cancelled = false;
    void loadTurnstile()
      .then(() => {
        if (cancelled || !host.current || !window.turnstile || widgetId.current) return;
        window.turnstile.ready(() => {
          if (cancelled || !host.current || !window.turnstile || widgetId.current) return;
          widgetId.current = window.turnstile.render(host.current, {
            sitekey,
            action,
            theme: "dark",
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(""),
            "error-callback": () => onTokenRef.current(""),
          });
        });
      })
      .catch(() => onTokenRef.current(""));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [action, sitekey]);

  useEffect(() => {
    if (resetKey === 0 || !widgetId.current || !window.turnstile) return;
    onTokenRef.current("");
    window.turnstile.reset(widgetId.current);
  }, [resetKey]);

  if (!sitekey) return null;
  return <div ref={host} className="flex min-h-[65px] justify-center" />;
}
