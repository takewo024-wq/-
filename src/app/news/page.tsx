import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CONTAINER, NEWS } from "../_lib/site";
import { SiteHeader, SiteFooter, PageHeader } from "../_components/site-chrome";
import { ArrowIcon } from "../_components/icons";

export const metadata: Metadata = {
  title: "お知らせ | ひだまり（仮）",
  description: "事業所からのお知らせ一覧（仮の内容です）。",
};

export default function NewsListPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />
      <main>
        <PageHeader
          title="お知らせ"
          lead="事業所からのお知らせや行事の報告をお届けします。"
          crumbs={[{ label: "ホーム", href: "/" }, { label: "お知らせ" }]}
        />

        <section className={`${CONTAINER} py-14 md:py-20`}>
          {/* イラスト（仮） */}
          <div className="relative mb-10 aspect-[16/5] overflow-hidden rounded-3xl bg-brand-tint2 ring-1 ring-brand/15">
            <Image
              src="/hp-media/news.png"
              alt="封筒や吹き出しをあしらったお知らせのイラスト（仮）"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover"
            />
          </div>
          <ul className="divide-y divide-black/5 border-y border-black/5">
            {NEWS.map((n) => (
              <li key={n.slug}>
                <Link
                  href={`/news/${n.slug}`}
                  className="group flex flex-col gap-2 py-6 transition hover:bg-brand-tint2 sm:flex-row sm:items-center sm:gap-5"
                >
                  <span className="text-sm text-ink-soft">{n.date}</span>
                  <span className="inline-block w-fit rounded-full bg-brand-tint px-3 py-0.5 text-xs font-bold text-brand-dark">
                    {n.cat}
                  </span>
                  <span className="flex-1 text-[15px] font-medium">{n.title}</span>
                  <ArrowIcon className="hidden h-4 w-4 text-brand transition group-hover:translate-x-1 sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
