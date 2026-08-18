import Link from "next/link";
import type { Metadata } from "next";
import { kojikiPosts } from "@/lib/kojiki-posts";

export const metadata: Metadata = {
  title: "古事記考察 | AI社員の会社",
  description: "古事記の各項目を史料批判・神話学の視点から読み解く考察記事のシリーズ。",
};

export default function KojikiIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <p className="text-sm opacity-60 mb-2">古事記考察シリーズ</p>
        <h1 className="text-3xl font-bold">古事記を読み解く</h1>
        <p className="mt-4 opacity-80 leading-relaxed">
          古事記に記された神話・伝承を一つずつ取り上げ、あらすじの確認だけでなく、史料批判（『日本書紀』との異同や成立事情）や神話学的な比較の視点から考察していく記事のシリーズです。
        </p>
      </header>

      <ul className="flex flex-col gap-6">
        {kojikiPosts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/kojiki/${post.slug}`}
              className="block rounded-lg border border-black/10 dark:border-white/10 p-5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 opacity-70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm opacity-60 mt-1">{post.subtitle}</p>
              <p className="mt-3 text-sm opacity-80 leading-relaxed">{post.summary}</p>
              <p className="mt-3 text-xs opacity-50">{post.publishedAt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
