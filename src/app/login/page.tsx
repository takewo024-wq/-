"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [siteUrl, setSiteUrl] = useState("");
  const [username, setUsername] = useState("");
  const [applicationPassword, setApplicationPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl, username, applicationPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ログインに失敗しました。");
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ログインに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 border border-black/10 dark:border-white/10 rounded-lg p-6"
      >
        <h1 className="text-lg font-semibold text-center">🏢 WordPressでログイン</h1>
        <p className="text-xs opacity-60 text-center">
          WordPressの「ユーザー」→「プロフィール」から発行できる
          アプリケーションパスワードでログインします。
        </p>

        <div className="flex flex-col gap-1">
          <label htmlFor="siteUrl" className="text-sm font-medium">
            WordPressサイトURL
          </label>
          <input
            id="siteUrl"
            type="url"
            required
            placeholder="https://example.com"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="rounded-lg border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-sm font-medium">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded-lg border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="applicationPassword" className="text-sm font-medium">
            アプリケーションパスワード
          </label>
          <input
            id="applicationPassword"
            type="password"
            required
            value={applicationPassword}
            onChange={(e) => setApplicationPassword(e.target.value)}
            className="rounded-lg border border-black/10 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="rounded-lg px-3 py-2 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 text-white px-5 py-2 font-medium disabled:opacity-40"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
