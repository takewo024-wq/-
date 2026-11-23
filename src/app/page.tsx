"use client";

import { useEffect, useState } from "react";
import { employeeList, employees, EmployeeId } from "@/lib/employees";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Threads = Record<EmployeeId, ChatMessage[]>;

const initialThreads: Threads = employeeList.reduce((acc, e) => {
  acc[e.id] = [{ role: "assistant", content: e.greeting }];
  return acc;
}, {} as Threads);

const STORAGE_KEY = "ai_company_threads_v1";

/** localStorage から会話履歴を読み込む（壊れていれば初期値にフォールバック）。 */
function loadThreads(): Threads {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialThreads;
    const parsed = JSON.parse(raw) as Partial<Record<EmployeeId, ChatMessage[]>>;
    const merged: Threads = { ...initialThreads };
    for (const e of employeeList) {
      const arr = parsed[e.id];
      if (Array.isArray(arr) && arr.length > 0) merged[e.id] = arr;
    }
    return merged;
  } catch {
    return initialThreads;
  }
}

function saveThreads(threads: Threads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // localStorage が使えない環境では黙って無視（履歴は非永続になる）
  }
}

function clearThreads() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 無視
  }
}

export default function Home() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = 判定中
  const [activeId, setActiveId] = useState<EmployeeId>(employeeList[0].id);
  const [threads, setThreads] = useState<Threads>(initialThreads);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初回マウント時にセッションの有効性を確認し、保存済みの会話履歴を読み込む
  useEffect(() => {
    let active = true;
    (async () => {
      const stored = loadThreads();
      if (active) setThreads(stored);
      try {
        const r = await fetch("/api/session");
        const d = await r.json();
        if (active) setAuthed(Boolean(d.authed));
      } catch {
        if (active) setAuthed(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 会話履歴が変わるたびに localStorage へ保存（ブラウザ単位で永続化）
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    clearThreads();
    setThreads(initialThreads);
    setAuthed(false);
  }

  const activeEmployee = employees[activeId];
  const messages = threads[activeId];
  const lastMsg = messages[messages.length - 1];
  // 最初のトークンが届くまで「入力中...」を表示する
  const showTyping =
    loading && !(lastMsg?.role === "assistant" && lastMsg.content.length > 0);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const threadId = activeId;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setThreads((prev) => ({ ...prev, [threadId]: nextMessages }));
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: threadId, messages: nextMessages }),
      });

      if (res.status === 401) {
        setAuthed(false);
        throw new Error("セッションが切れました。再度ログインしてください。");
      }

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "エラーが発生しました。");
      }

      // 空のアシスタント枠を追加し、ストリームの text を順次追記していく
      setThreads((prev) => ({
        ...prev,
        [threadId]: [...prev[threadId], { role: "assistant", content: "" }],
      }));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setThreads((prev) => {
          const thread = [...prev[threadId]];
          thread[thread.length - 1] = { role: "assistant", content: acc };
          return { ...prev, [threadId]: thread };
        });
      }

      if (!acc) throw new Error("応答が空でした。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  if (authed === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm opacity-60">
        読み込み中...
      </div>
    );
  }

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="flex flex-1 h-full">
      <aside className="w-64 shrink-0 border-r border-black/10 dark:border-white/10 flex flex-col">
        <div className="p-4 border-b border-black/10 dark:border-white/10">
          <h1 className="font-semibold text-lg">🏢 AI社員の会社</h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          {employeeList.map((e) => (
            <button
              key={e.id}
              onClick={() => setActiveId(e.id)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/5 transition-colors ${
                activeId === e.id
                  ? "bg-black/5 dark:bg-white/10"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span className="text-2xl">{e.avatar}</span>
              <span>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs opacity-60">{e.role}</div>
              </span>
            </button>
          ))}
        </nav>
        <button
          onClick={logout}
          className="m-3 rounded-lg border border-black/10 dark:border-white/20 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          ログアウト
        </button>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-black/10 dark:border-white/10 flex items-center gap-3">
          <span className="text-2xl">{activeEmployee.avatar}</span>
          <div>
            <div className="font-medium">{activeEmployee.name}</div>
            <div className="text-xs opacity-60">{activeEmployee.role}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((m, i) =>
            m.content.length === 0 ? null : (
              <div
                key={i}
                className={`max-w-2xl whitespace-pre-wrap rounded-lg px-4 py-2 ${
                  m.role === "user"
                    ? "self-end bg-blue-600 text-white"
                    : "self-start bg-black/5 dark:bg-white/10"
                }`}
              >
                {m.content}
              </div>
            )
          )}
          {showTyping && (
            <div className="self-start rounded-lg px-4 py-2 bg-black/5 dark:bg-white/10 opacity-60">
              入力中...
            </div>
          )}
          {error && (
            <div className="self-start rounded-lg px-4 py-2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-4 border-t border-black/10 dark:border-white/10 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${activeEmployee.name}にメッセージを送る...`}
            className="flex-1 rounded-lg border border-black/10 dark:border-white/20 bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-blue-600 text-white px-5 py-2 font-medium disabled:opacity-40"
          >
            送信
          </button>
        </form>
      </main>
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!password || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "ログインに失敗しました。");
      setPassword("");
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="w-full max-w-sm flex flex-col gap-4 rounded-xl border border-black/10 dark:border-white/15 p-6"
      >
        <div>
          <h1 className="font-semibold text-lg">🏢 AI社員の会社</h1>
          <p className="text-sm opacity-60 mt-1">続けるにはパスワードを入力してください。</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          autoFocus
          className="rounded-lg border border-black/10 dark:border-white/20 bg-transparent px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        {error && (
          <div className="rounded-lg px-3 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="rounded-lg bg-blue-600 text-white px-5 py-2 font-medium disabled:opacity-40"
        >
          {loading ? "確認中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
