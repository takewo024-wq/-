import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CONTAINER, SERVICES } from "../_lib/site";
import {
  SiteHeader,
  SiteFooter,
  PageHeader,
  ContactCta,
} from "../_components/site-chrome";
import { Icon, CheckIcon, ArrowIcon } from "../_components/icons";

export const metadata: Metadata = {
  title: "サービス紹介 | めいと",
  description: "放課後等デイサービスと生活介護のご案内（仮の内容です）。",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />
      <main>
        <PageHeader
          title="サービス紹介"
          lead="重症心身障がいのあるお子さま・方への、2つのサービスをご用意しています。"
          crumbs={[{ label: "ホーム", href: "/" }, { label: "サービス紹介" }]}
        />

        <section className={`${CONTAINER} py-14 md:py-20`}>
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((s) => (
              <article
                key={s.slug}
                className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              >
                <div className="relative aspect-[3/1] bg-brand-tint2">
                  <Image
                    src={s.image}
                    alt={`${s.tag}のイメージイラスト（仮）`}
                    fill
                    sizes="(max-width: 768px) 100vw, 520px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-9">
                  <div className="-mt-12 flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white ring-4 ring-white">
                      <Icon name={s.icon} className="h-7 w-7" />
                    </span>
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-dark shadow-sm">
                      {s.tag}
                    </span>
                  </div>
                  <h2 className="mt-5 text-lg font-bold leading-relaxed">{s.title}</h2>
                  <p className="mt-3 flex-1 text-sm leading-7 text-ink-soft">{s.summary}</p>
                  <ul className="mt-5 space-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services/${s.slug}`}
                    className="mt-6 inline-flex items-center gap-1.5 self-start rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
                  >
                    詳しく見る
                    <ArrowIcon className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <ContactCta />
      </main>
      <SiteFooter />
    </div>
  );
}
