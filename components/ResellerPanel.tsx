"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import { creditPacks, type ResellerAccount, type ResellerDashboard, type ResellerDevice, type ResellerError } from "@/lib/reseller";

type View = "dashboard" | "devices" | "subs";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-white/40";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

export function ResellerPanel({ initial }: { initial: ResellerDashboard }) {
  const { t, locale } = useI18n();
  const copy = t.resellerPanel;
  const router = useRouter();
  const [dash, setDash] = useState(initial);
  const [view, setView] = useState<View>("dashboard");
  const [menu, setMenu] = useState(false);
  const [devices, setDevices] = useState<ResellerDevice[]>([]);
  const [accounts, setAccounts] = useState<ResellerAccount[]>([]);
  const [deviceQuery, setDeviceQuery] = useState("");
  const [subQuery, setSubQuery] = useState("");
  const [buyOpen, setBuyOpen] = useState(false);
  const [pix, setPix] = useState<{ id: string; amountCents: number; credits: number; pixPayload: string; pixQr: string; status: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [mac, setMac] = useState("");
  const [comment, setComment] = useState("");
  const [subOpen, setSubOpen] = useState(false);
  const [sub, setSub] = useState({ name: "", email: "", phone: "", password: "", credits: "0" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState<ResellerError | null>(null);
  const [busy, setBusy] = useState(false);

  const money = (cents: number) => new Intl.NumberFormat(locale, { style: "currency", currency: "BRL" }).format(cents / 100);
  const when = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(new Date(iso));

  async function call(action: string, payload: Record<string, unknown> = {}) {
    const response = await fetch("/api/reseller", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (response.status === 401) {
      router.replace("/revendedor");
      router.refresh();
      return null;
    }
    if (!response.ok || !data) {
      setError((data?.error as ResellerError) ?? "save");
      return null;
    }
    setError(null);
    return data;
  }

  async function refreshDash() {
    const data = await call("dashboard");
    if (!data) return;
    setDash({
      name: String(data.name ?? dash.name),
      email: String(data.email ?? dash.email),
      credits: Number(data.credits ?? 0),
      total: Number(data.total ?? 0),
      today: Number(data.today ?? 0),
      month: Number(data.month ?? 0),
      resellers: Number(data.resellers ?? 0),
      spent: Number(data.spent ?? 0),
    });
  }

  async function loadDevices(query = deviceQuery) {
    const data = await call("devices", { query });
    if (!data) return;
    setDevices((data.devices as ResellerDevice[]) ?? []);
    if (typeof data.credits === "number") setDash((current) => ({ ...current, credits: data.credits as number }));
  }

  async function loadSubs(query = subQuery) {
    const data = await call("subs", { query });
    if (!data) return;
    setAccounts((data.accounts as ResellerAccount[]) ?? []);
  }

  async function openView(next: View) {
    setView(next);
    setMenu(false);
    setNotice("");
    setError(null);
    if (next === "dashboard") await refreshDash();
    if (next === "devices") await loadDevices();
    if (next === "subs") await loadSubs();
  }

  async function buyPack(credits: number) {
    if (busy) return;
    setBusy(true);
    setCopied(false);
    const data = await call("buy-credits", { credits });
    setBusy(false);
    if (!data?.id) return;
    setPix({
      id: String(data.id),
      amountCents: Number(data.amountCents ?? 0),
      credits: Number(data.credits ?? credits),
      pixPayload: String(data.pixPayload ?? ""),
      pixQr: String(data.pixQr ?? ""),
      status: String(data.status ?? "pending"),
    });
  }

  useEffect(() => {
    if (!pix || pix.status !== "pending") return;
    const timer = window.setInterval(async () => {
      const data = await call("credit-status", { id: pix.id });
      if (!data?.status) return;
      const status = String(data.status);
      setPix((current) => (current ? { ...current, status, pixPayload: String(data.pixPayload ?? current.pixPayload), pixQr: String(data.pixQr ?? current.pixQr) } : current));
      if (status === "paid") {
        setNotice(copy.buyPaid);
        await refreshDash();
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [pix?.id, pix?.status]);

  async function copyPix() {
    if (!pix?.pixPayload) return;
    try {
      await navigator.clipboard.writeText(pix.pixPayload);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function logout() {
    await fetch("/api/reseller/logout", { method: "POST" });
    router.replace("/revendedor");
    router.refresh();
  }

  async function onActivate(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const data = await call("activate", { mac, comment });
    setBusy(false);
    if (!data) return;
    setActivateOpen(false);
    setMac("");
    setComment("");
    setNotice(copy.activated);
    await loadDevices();
    await refreshDash();
  }

  async function onCreateSub(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const data = await call("create-sub", { ...sub, credits: Number(sub.credits) });
    setBusy(false);
    if (!data) return;
    setSubOpen(false);
    setSub({ name: "", email: "", phone: "", password: "", credits: "0" });
    setNotice(copy.created);
    await loadSubs();
    await refreshDash();
  }

  const nav = [
    { id: "dashboard" as const, label: copy.dashboard, icon: <Icon><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /></Icon> },
    { id: "devices" as const, label: copy.devices, icon: <Icon><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></Icon> },
    { id: "subs" as const, label: copy.subs, icon: <Icon><path d="M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1" /><circle cx="10" cy="8" r="3" /><path d="M20 19v-1a3 3 0 0 0-2.2-2.9M16 5.1a3 3 0 0 1 0 5.8" /></Icon> },
  ];

  return (
    <main id="conteudo" className="fixed inset-0 z-[60] flex bg-[#101010] text-soft">
      {menu ? <button type="button" aria-label={copy.close} className="fixed inset-0 z-10 bg-black/60 md:hidden" onClick={() => setMenu(false)} /> : null}
      <aside className={`${menu ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-white/10 bg-[#0c0c0c] px-4 py-5 transition-transform md:static md:translate-x-0`}>
        <Logo className="h-12 w-12" />
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#161616] px-3 py-3">
          <div className="flex items-center justify-between gap-2 text-sm text-white">
            <span className="inline-flex items-center gap-2"><Icon><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></Icon>{copy.credits}</span>
            <button type="button" aria-label={copy.refresh} onClick={() => void refreshDash()} className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-muted hover:text-white">
              <Icon><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8" /><path d="M20 3v5h-5" /></Icon>
            </button>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{dash.credits}</p>
        </div>
        <button type="button" onClick={() => { setBuyOpen(true); setPix(null); setMenu(false); }} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white hover:bg-accent-bright">
          <Icon><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></Icon>
          {copy.buy}
        </button>
        <nav className="mt-4 space-y-1">
          {nav.map((item) => (
            <button key={item.id} type="button" onClick={() => void openView(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${view === item.id ? "bg-accent text-white" : "text-soft hover:bg-white/5"}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-1 pt-6">
          <a href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted hover:bg-white/5 hover:text-white">
            <Icon><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /></Icon>
            {copy.home}
          </a>
          <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted hover:bg-white/5 hover:text-white">
            <Icon><path d="M9 6H5v12h4M10 12h10M16 8l4 4-4 4" /></Icon>
            {copy.logout}
          </button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button type="button" aria-label={copy.menu} onClick={() => setMenu(true)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white md:hidden">
              <Icon><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
            </button>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">{view === "dashboard" ? copy.welcome : nav.find((item) => item.id === view)?.label}</h1>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-sm font-semibold text-white">{dash.name.slice(0, 1).toUpperCase()}</span>
        </div>

        {view === "dashboard" ? (
          <div className="mt-6">
            <article className="rounded-2xl border border-accent/40 bg-gradient-to-r from-[#3a1014] to-[#161616] px-6 py-10 text-center">
              <p className="text-sm text-soft">{copy.total}</p>
              <p className="mt-2 text-5xl font-semibold text-white">{dash.total}</p>
            </article>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [copy.today, dash.today],
                [copy.month, dash.month],
                [copy.resellerCount, dash.resellers],
                [copy.spent, dash.spent],
              ].map(([label, value]) => (
                <article key={String(label)} className="rounded-2xl border border-white/10 bg-[#161616] px-4 py-6 text-center">
                  <p className="text-sm text-muted">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {view === "devices" ? (
          <div className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form className="flex flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); void loadDevices(); }}>
                <input value={deviceQuery} onChange={(event) => setDeviceQuery(event.target.value)} placeholder={copy.searchDevices} className={inputClass} />
                <button type="submit" className="rounded-xl bg-accent px-4 text-sm font-semibold text-white">{copy.search}</button>
              </form>
              <button type="button" onClick={() => { setMac(""); setComment(""); setError(null); setActivateOpen(true); }} className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white">
                {copy.activate}
              </button>
            </div>
            <Table headers={[copy.columns.id, copy.columns.mac, copy.columns.comment, copy.columns.expires, copy.columns.package, copy.columns.actions]} empty={devices.length === 0 ? copy.emptyDevices : ""}>
              {devices.map((device) => (
                <tr key={device.id} className="border-t border-white/10 text-sm">
                  <td className="px-4 py-3">{device.id}</td>
                  <td className="px-4 py-3 text-white">{device.mac}</td>
                  <td className="px-4 py-3">{device.comment || "—"}</td>
                  <td className="px-4 py-3">{when(device.expiresAt)}</td>
                  <td className="px-4 py-3">{device.packageLabel}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-accent-bright hover:text-white" onClick={() => { setMac(device.mac); setComment(device.comment); setActivateOpen(true); }}>
                      {copy.renew}
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        ) : null}

        {view === "subs" ? (
          <div className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form className="flex flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); void loadSubs(); }}>
                <input value={subQuery} onChange={(event) => setSubQuery(event.target.value)} placeholder={copy.searchSubs} className={inputClass} />
                <button type="submit" className="rounded-xl bg-accent px-4 text-sm font-semibold text-white">{copy.search}</button>
              </form>
              <button type="button" onClick={() => { setError(null); setSubOpen(true); }} className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white">{copy.add}</button>
            </div>
            <Table headers={[copy.columns.id, copy.columns.name, copy.columns.email, copy.columns.phone, copy.columns.credits, copy.columns.actions]} empty={accounts.length === 0 ? copy.emptySubs : ""}>
              {accounts.map((account, index) => (
                <tr key={account.id} className="border-t border-white/10 text-sm">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 text-white">{account.name}</td>
                  <td className="px-4 py-3">{account.email}</td>
                  <td className="px-4 py-3">{account.phone || "—"}</td>
                  <td className="px-4 py-3">{account.credits}</td>
                  <td className="px-4 py-3 text-muted">—</td>
                </tr>
              ))}
            </Table>
          </div>
        ) : null}

        {notice ? <p role="status" className="mt-4 text-sm text-soft">{notice}</p> : null}
        {error ? <p role="alert" className="mt-4 text-sm text-accent-bright">{copy.errors[error] ?? copy.errors.save}</p> : null}
      </section>

      {buyOpen ? (
        <Modal title={copy.buyTitle} lead={copy.buyLead} onClose={() => { setBuyOpen(false); setPix(null); }} closeLabel={copy.close}>
          {pix ? (
            <div className="text-center">
              <p className="text-3xl font-semibold text-white">{money(pix.amountCents)}</p>
              <p className="mt-1 text-sm text-soft">{copy.packCredits.replace("{count}", String(pix.credits))}</p>
              {pix.status === "paid" ? (
                <p role="status" className="mt-4 text-sm text-soft">{copy.buyPaid}</p>
              ) : (
                <>
                  {pix.pixQr ? (
                    <img src={`data:image/png;base64,${pix.pixQr.replace(/^data:image\/[a-z+]+;base64,/i, "")}`} alt={copy.pixCode} className="mx-auto mt-4 h-52 w-52 rounded-2xl bg-white p-3" />
                  ) : null}
                  {pix.pixPayload ? <p className="mt-4 break-all rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center font-mono text-xs text-white">{pix.pixPayload}</p> : null}
                  <button type="button" onClick={() => void copyPix()} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white">
                    {copied ? copy.copied : copy.copy}
                  </button>
                  <p className="mt-3 text-sm text-soft">{copy.waiting}</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {creditPacks.map((pack) => (
                <article key={pack.credits} className="rounded-2xl border border-white/10 bg-[#101010] p-4 text-center">
                  <p className="text-lg font-semibold text-white">{copy.packCredits.replace("{count}", String(pack.credits))}</p>
                  <p className="mt-4 text-xs tracking-[0.14em] text-muted">{copy.priceLabel}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{money(pack.priceCents)}</p>
                  <button type="button" disabled={busy} onClick={() => void buyPack(pack.credits)} className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white disabled:opacity-60">
                    {copy.buyAction}
                  </button>
                </article>
              ))}
            </div>
          )}
        </Modal>
      ) : null}

      {activateOpen ? (
        <Modal title={copy.activate} lead={copy.activateNote} onClose={() => setActivateOpen(false)} closeLabel={copy.close}>
          <form onSubmit={onActivate} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-soft">{copy.mac}</span>
              <input value={mac} onChange={(event) => setMac(event.target.value)} placeholder="AA:BB:CC:DD:EE:FF" className={inputClass} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-soft">{copy.comment}</span>
              <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder={copy.commentPlaceholder} className={inputClass} />
            </label>
            <button type="submit" disabled={busy} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent font-semibold text-white disabled:opacity-60">
              {busy ? copy.activating : copy.confirmActivate}
            </button>
          </form>
        </Modal>
      ) : null}

      {subOpen ? (
        <Modal title={copy.subTitle} lead={copy.subLead} onClose={() => setSubOpen(false)} closeLabel={copy.close}>
          <form onSubmit={onCreateSub} className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-soft">{copy.columns.name}</span>
              <input value={sub.name} onChange={(event) => setSub({ ...sub, name: event.target.value })} className={inputClass} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-soft">{copy.email}</span>
              <input value={sub.email} onChange={(event) => setSub({ ...sub, email: event.target.value })} type="email" className={inputClass} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-soft">{copy.phone}</span>
              <input value={sub.phone} onChange={(event) => setSub({ ...sub, phone: event.target.value })} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-soft">{copy.password}</span>
              <input value={sub.password} onChange={(event) => setSub({ ...sub, password: event.target.value })} type="password" minLength={8} className={inputClass} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-soft">{copy.transfer}</span>
              <input value={sub.credits} onChange={(event) => setSub({ ...sub, credits: event.target.value })} inputMode="numeric" className={inputClass} required />
            </label>
            <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 font-semibold text-white disabled:opacity-60 sm:col-span-2">
              {busy ? copy.creating : copy.create}
            </button>
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

function Table({ headers, empty, children }: { headers: string[]; empty: string; children: ReactNode }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-[720px] w-full text-left">
        <thead className="text-xs uppercase tracking-[0.12em] text-muted">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-sm text-muted">{empty}</td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ title, lead, onClose, closeLabel, children }: { title: string; lead: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 px-4 py-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#161616] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-muted">{lead}</p>
          </div>
          <button type="button" aria-label={closeLabel} onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white">×</button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
