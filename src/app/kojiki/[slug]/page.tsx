import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKojikiPost, kojikiPosts } from "@/lib/kojiki-posts";

export function generateStaticParams() {
  return kojikiPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getKojikiPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | 古事記考察`,
    description: post.summary,
  };
}

export default async function KojikiPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getKojikiPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/kojiki" className="text-sm opacity-60 hover:opacity-100">
        ← 古事記考察シリーズ一覧
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 opacity-70"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="mt-2 text-lg opacity-70">{post.subtitle}</p>
        <p className="mt-3 text-xs opacity-50">{post.publishedAt}</p>
      </header>

      <div className="flex flex-col gap-10">
        {post.sections.slice(0, -1).map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold mb-4">{section.heading}</h2>
            <div className="flex flex-col gap-4">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="leading-relaxed opacity-90">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        {post.contrasts.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-1">
              古事記にはこう書かれている、しかし実際には
            </h2>
            <p className="text-sm opacity-60 mb-6">
              表向きの記述と、史料批判・考古学的知見から推測される実態を対比する。
            </p>
            <div className="flex flex-col gap-6">
              {post.contrasts.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden"
                >
                  <div className="p-4 bg-black/5 dark:bg-white/5">
                    <p className="text-xs font-medium opacity-50 mb-1">
                      古事記の記述
                    </p>
                    <p className="leading-relaxed">{c.claim}</p>
                  </div>
                  <div className="p-4 bg-amber-500/10">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                      実際には、こうだったと考えられる
                    </p>
                    <p className="leading-relaxed">{c.reality}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium opacity-50 mb-1">根拠</p>
                    <p className="leading-relaxed text-sm opacity-80">{c.basis}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {post.sections.slice(-1).map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold mb-4">{section.heading}</h2>
            <div className="flex flex-col gap-4">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="leading-relaxed opacity-90">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
