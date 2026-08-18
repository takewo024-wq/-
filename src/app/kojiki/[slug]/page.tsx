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
        {post.sections.map((section) => (
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
