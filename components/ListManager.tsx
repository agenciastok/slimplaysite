"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import type { ManageError, ManagedList } from "@/lib/managed-list";

type Kind = "code" | "url" | "xtream";

type Draft = {
  type: Kind;
  playlistName: string;
  m3uUrl: string;
  epgUrl: string;
  serverUrl: string;
  username: string;
  password: string;
  shortCode: string;
};

const emptyDraft: Draft = {
  type: "url",
  playlistName: "",
  m3uUrl: "",
  epgUrl: "",
  serverUrl: "",
  username: "",
  password: "",
  shortCode: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition-colors placeholder:text-muted focus:border-white/40";

function draftFromList(list: ManagedList): Draft {
  const type: Kind = list.playlistType === "code" || list.playlistType === "xtream" ? list.playlistType : "url";
  return {
    type,
    playlistName: list.playlistName ?? "",
    m3uUrl: type === "url" ? (list.m3uUrl ?? "") : "",
    epgUrl: list.epgUrl ?? "",
    serverUrl: type === "xtream" ? (list.m3uUrl ?? "") : "",
    username: list.username ?? "",
    password: "",
    shortCode: type === "code" ? (list.m3uUrl ?? "") : "",
  };
}

function payload(draft: Draft) {
  return {
    type: draft.type,
    playlistName: draft.playlistName,
    m3uUrl: draft.m3uUrl,
    epgUrl: draft.epgUrl,
    serverUrl: draft.serverUrl,
    username: draft.username,
    password: draft.password,
    shortCode: draft.shortCode,
  };
}

export function ListManager({ mac, initialLists }: { mac: string; initialLists: ManagedList[] }) {
  const { t } = useI18n();
  const copy = t.manage;
  const fields = t.uploadForm;
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<number | null>(null);
  const [error, setError] = useState<ManageError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch("/api/manage/lists", { cache: "no-store" });
    if (response.status === 401) {
      router.replace("/login");
      return;
    }
    const data = (await response.json()) as { lists?: ManagedList[]; error?: ManageError };
    if (!response.ok) {
      setError(data.error ?? "save");
      return;
    }
    setLists(data.lists ?? []);
  }

  async function send(method: "POST" | "PATCH" | "DELETE", body: unknown) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/manage/lists", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: ManageError } | null;
      if (response.status === 401) {
        router.replace("/login");
        return false;
      }
      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "save");
        return false;
      }
      await refresh();
      return true;
    } catch {
      setError("save");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await send("POST", payload(draft))) {
      setDraft(emptyDraft);
      setNotice(copy.saved);
    }
  }

  async function onUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingId == null) return;
    if (await send("PATCH", { id: editingId, ...payload(editDraft) })) {
      setEditingId(null);
      setNotice(copy.saved);
    }
  }

  async function onDelete(id: number) {
    if (await send("DELETE", { id })) {
      setConfirmId(null);
      setEditingId(null);
      setNotice(copy.deleted);
    }
  }

  async function logout() {
    await fetch("/api/manage/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function typeLabel(type: string | null) {
    if (type === "code" || type === "url" || type === "xtream" || type === "file") return copy.types[type];
    return copy.types.unknown;
  }

  return (
    <main id="conteudo" className="px-5 pt-28 pb-20 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">{copy.panelTitle}</h1>
            <p className="mt-3 text-soft">{copy.panelSubtitle}</p>
            <p className="mt-1 font-mono text-sm text-muted">{mac}</p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:border-white"
          >
            {copy.logout}
          </button>
        </div>

        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-accent-bright/40 bg-accent/10 px-4 py-3 text-sm text-accent-bright">
            {copy.errors[error] ?? copy.errors.save}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="mt-6 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white">
            {notice}
          </p>
        ) : null}

        <form onSubmit={onCreate} className="mt-8 rounded-3xl border border-white/10 bg-[#161616]/80 p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-white">{copy.addTitle}</h2>
          <KindTabs value={draft.type} onChange={(type) => setDraft({ ...draft, type })} labels={copy.types} />
          <ListFields
            draft={draft}
            onChange={setDraft}
            labels={fields}
            keepPassword={false}
            keepPasswordLabel={copy.keepPassword}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-accent-bright disabled:opacity-60 sm:w-auto"
          >
            {busy ? copy.saving : copy.save}
          </button>
        </form>

        <ul className="mt-8 space-y-4">
          {lists.length === 0 ? <li className="rounded-3xl border border-white/10 px-5 py-8 text-center text-muted">{copy.empty}</li> : null}
          {lists.map((list) => {
            const file = list.playlistType === "file";
            return (
              <li key={list.id} className="rounded-3xl border border-white/10 bg-[#161616]/80 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-bright">{typeLabel(list.playlistType)}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{list.playlistName || typeLabel(list.playlistType)}</h3>
                  </div>
                  <div className="flex gap-2">
                    {file ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(list.id);
                          setEditDraft(draftFromList(list));
                          setConfirmId(null);
                        }}
                        className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:border-white"
                      >
                        {copy.edit}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmId(list.id)}
                      className="rounded-full border border-accent-bright/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-bright hover:bg-accent/10"
                    >
                      {copy.remove}
                    </button>
                  </div>
                </div>

                {file ? <p className="mt-4 text-sm text-muted">{copy.fileNote}</p> : <ListDetails list={list} revealed={revealed === list.id} onToggle={() => setRevealed(revealed === list.id ? null : list.id)} show={copy.show} hide={copy.hide} />}

                {confirmId === list.id ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 px-4 py-3">
                    <p className="text-sm text-soft">{copy.confirmDelete}</p>
                    <button type="button" disabled={busy} onClick={() => void onDelete(list.id)} className="text-sm font-semibold text-accent-bright">
                      {copy.remove}
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="text-sm text-muted hover:text-white">
                      {copy.cancel}
                    </button>
                  </div>
                ) : null}

                {editingId === list.id && !file ? (
                  <form onSubmit={onUpdate} className="mt-4 border-t border-white/10 pt-4">
                    <KindTabs value={editDraft.type} onChange={(type) => setEditDraft({ ...editDraft, type })} labels={copy.types} />
                    <ListFields
                      draft={editDraft}
                      onChange={setEditDraft}
                      labels={fields}
                      keepPassword={editDraft.type === "xtream"}
                      keepPasswordLabel={copy.keepPassword}
                    />
                    <div className="mt-4 flex gap-3">
                      <button type="submit" disabled={busy} className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-accent-bright disabled:opacity-60">
                        {copy.save}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-sm text-muted hover:text-white">
                        {copy.cancel}
                      </button>
                    </div>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}

function KindTabs({
  value,
  onChange,
  labels,
}: {
  value: Kind;
  onChange: (type: Kind) => void;
  labels: { code: string; url: string; xtream: string };
}) {
  const tabs: Array<{ id: Kind; label: string }> = [
    { id: "code", label: labels.code },
    { id: "url", label: labels.url },
    { id: "xtream", label: labels.xtream },
  ];
  return (
    <div className="mt-4 grid grid-cols-3 gap-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={
            value === tab.id
              ? "rounded-full bg-white px-3 py-2.5 text-sm font-semibold text-[#161616]"
              : "rounded-full border border-white/10 px-3 py-2.5 text-sm text-muted hover:text-white"
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ListFields({
  draft,
  onChange,
  labels,
  keepPassword,
  keepPasswordLabel,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
  labels: {
    playlistName: string;
    playlistNamePlaceholder: string;
    shortCode: string;
    m3uUrl: string;
    epgUrl: string;
    serverUrl: string;
    username: string;
    password: string;
  };
  keepPassword: boolean;
  keepPasswordLabel: string;
}) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  return (
    <div className="mt-4 space-y-4">
      {draft.type !== "code" ? (
        <label className="block">
          <span className="mb-2 block text-sm text-soft">{labels.playlistName}</span>
          <input value={draft.playlistName} onChange={(event) => set({ playlistName: event.target.value })} placeholder={labels.playlistNamePlaceholder} maxLength={80} className={inputClass} required />
        </label>
      ) : (
        <label className="block">
          <span className="mb-2 block text-sm text-soft">{labels.shortCode}</span>
          <input value={draft.shortCode} onChange={(event) => set({ shortCode: event.target.value })} autoComplete="off" spellCheck={false} className={inputClass} required />
        </label>
      )}
      {draft.type === "url" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm text-soft">{labels.m3uUrl}</span>
            <input value={draft.m3uUrl} onChange={(event) => set({ m3uUrl: event.target.value })} placeholder="https://" autoComplete="off" spellCheck={false} className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-soft">{labels.epgUrl}</span>
            <input value={draft.epgUrl} onChange={(event) => set({ epgUrl: event.target.value })} placeholder="https://" autoComplete="off" spellCheck={false} className={inputClass} />
          </label>
        </>
      ) : null}
      {draft.type === "xtream" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm text-soft">{labels.serverUrl}</span>
            <input value={draft.serverUrl} onChange={(event) => set({ serverUrl: event.target.value })} placeholder="http://" autoComplete="off" spellCheck={false} className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-soft">{labels.username}</span>
            <input value={draft.username} onChange={(event) => set({ username: event.target.value })} autoComplete="off" spellCheck={false} className={inputClass} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-soft">{labels.password}</span>
            <input value={draft.password} onChange={(event) => set({ password: event.target.value })} type="password" autoComplete="new-password" placeholder={keepPassword ? keepPasswordLabel : ""} className={inputClass} required={!keepPassword} />
          </label>
        </>
      ) : null}
    </div>
  );
}

function ListDetails({
  list,
  revealed,
  onToggle,
  show,
  hide,
}: {
  list: ManagedList;
  revealed: boolean;
  onToggle: () => void;
  show: string;
  hide: string;
}) {
  if (list.playlistType === "code") {
    return <p className="mt-4 break-all font-mono text-sm text-soft">{list.m3uUrl}</p>;
  }
  if (list.playlistType === "xtream") {
    return (
      <dl className="mt-4 space-y-1 text-sm text-soft">
        <div className="break-all">{list.m3uUrl}</div>
        <div>{list.username}</div>
        <div className="flex items-center gap-3">
          <span className="font-mono">{revealed ? list.password : "••••••"}</span>
          <button type="button" onClick={onToggle} className="text-xs uppercase tracking-[0.12em] text-muted hover:text-white">
            {revealed ? hide : show}
          </button>
        </div>
      </dl>
    );
  }
  return (
    <div className="mt-4 space-y-1 break-all text-sm text-soft">
      {list.m3uUrl ? <p>{list.m3uUrl}</p> : null}
      {list.epgUrl ? <p className="text-muted">{list.epgUrl}</p> : null}
    </div>
  );
}
