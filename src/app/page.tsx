"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Home() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<EmployeeId>(employeeList[0].id);
  const [threads, setThreads] = useState<Threads>(initialThreads);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const activeEmployee = employees[activeId];
  const messages = threads[activeId];

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setThreads((prev) => ({ ...prev, [activeId]: nextMessages }));
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: activeId, messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "エラーが発生しました。");

      setThreads((prev) => ({
        ...prev,
        [activeId]: [...prev[activeId], { role: "assistant", content: data.reply }],
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 h-full">
      <aside className="w-64 shrink-0 border-r border-black/10 dark:border-white/10 flex flex-col">
        <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
          <h1 className="font-semibold text-lg">🏢 AI社員の会社</h1>
          <button
            onClick={handleLogout}
            className="text-xs opacity-60 hover:opacity-100 underline shrink-0"
          >
            ログアウト
          </button>
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
          {messages.map((m, i) => (
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
          ))}
          {loading && (
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
