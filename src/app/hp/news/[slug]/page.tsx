import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTAINER, NEWS, getNews } from "../../_lib/site";
import { SiteHeader, SiteFooter, PageHeader } from "../../_components/site-chrome";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return NEWS.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getNews(slug);
  if (!item) return { title: "お知らせ | ひだまり（仮）" };
  return { title: `${item.title} | ひだまり（仮）`, description: item.body[0] };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const item = getNews(slug);
  if (!item) notFound();

  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />
      <main>
        <PageHeader
          title={item.title}
          crumbs={[
            { label: "ホーム", href: "/hp" },
            { label: "お知らせ", href: "/hp/news" },
            { label: item.title },
          ]}
        />

        <article className={`${CONTAINER} py-14 md:py-20`}>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft">{item.date}</span>
            <span className="inline-block rounded-full bg-brand-tint px-3 py-0.5 text-xs font-bold text-brand-dark">
              {item.cat}
            </span>
          </div>

          <div className="mt-8 max-w-2xl space-y-5">
            {item.body.map((p, i) => (
              <p key={i} className="text-[15px] leading-8 text-ink">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-12 border-t border-black/5 pt-8">
            <Link
              href="/hp/news"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-white px-5 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-brand-tint"
            >
              ← お知らせ一覧へ戻る
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
