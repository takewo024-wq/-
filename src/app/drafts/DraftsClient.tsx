"use client";

import { useState } from "react";

interface Draft {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  note: { key: string; editUrl: string; postedAt: string } | null;
}

export default function DraftsClient({ initialDrafts }: { initialDrafts: Draft[] }) {
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = drafts.find((d) => d.id === selectedId) ?? null;

  async function refresh() {
    const res = await fetch("/api/drafts");
    const data = await res.json();
    setDrafts(data.drafts ?? []);
  }

  function selectDraft(draft: Draft | null) {
    setSelectedId(draft?.id ?? null);
    setTitle(draft?.title ?? "");
    setBody(draft?.body ?? "");
    setError(null);
  }

  async function saveDraft() {
    if (!title.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      if (selectedId) {
        const res = await fetch(`/api/drafts/${selectedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSelectedId(data.draft.id);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSelected() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/drafts/${selectedId}`, { method: "DELETE" });
      selectDraft(null);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function postToNote() {
    if (!selectedId || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/drafts/${selectedId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "note への送信に失敗しました。");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "note への送信に失敗しました。");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="flex flex-1 h-full">
      <aside className="w-72 shrink-0 border-r border-black/10 dark:border-white/10 flex flex-col">
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <h1 className="font-semibold text-lg">下書き管理</h1>
          <button
            onClick={() => selectDraft(null)}
            className="text-sm rounded-lg bg-blue-600 text-white px-3 py-1.5"
          >
            + 新規
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {drafts.length === 0 && (
            <p className="p-4 text-sm opacity-60">下書きはまだありません。</p>
          )}
          {drafts.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDraft(d)}
              className={`w-full text-left px-4 py-3 border-b border-black/5 dark:border-white/5 transition-colors ${
                selectedId === d.id
                  ? "bg-black/5 dark:bg-white/10"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="font-medium truncate">{d.title || "(無題)"}</div>
              <div className="text-xs opacity-60">
                {d.note ? `note 送信済み: ${new Date(d.note.postedAt).toLocaleString("ja-JP")}` : "未送信"}
              </div>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="rounded-lg border border-black/10 dark:border-white/20 bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="本文（空行で段落分け）"
          className="flex-1 min-h-[300px] rounded-lg border border-black/10 dark:border-white/20 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        {error && (
          <div className="rounded-lg px-4 py-2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {selected?.note && (
          <div className="rounded-lg px-4 py-2 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 text-sm">
            note に下書き送信済みです。
            <a
              href={selected.note.editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              note で編集を開く
            </a>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={saveDraft}
            disabled={loading || !title.trim()}
            className="rounded-lg bg-blue-600 text-white px-5 py-2 font-medium disabled:opacity-40"
          >
            保存
          </button>
          <button
            onClick={postToNote}
            disabled={!selectedId || posting}
            className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-5 py-2 font-medium disabled:opacity-40"
          >
            {posting ? "note に送信中..." : "note 下書きに送信"}
          </button>
          {selectedId && (
            <button
              onClick={deleteSelected}
              disabled={loading}
              className="rounded-lg border border-red-500 text-red-600 px-5 py-2 font-medium disabled:opacity-40 ml-auto"
            >
              削除
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
