import Link from "next/link";
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
  title: "サービス紹介 | ひだまり（仮）",
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
          crumbs={[{ label: "ホーム", href: "/hp" }, { label: "サービス紹介" }]}
        />

        <section className={`${CONTAINER} py-14 md:py-20`}>
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((s) => (
              <article
                key={s.slug}
                className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5 transition hover:shadow-md md:p-9"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                    <Icon name={s.icon} className="h-7 w-7" />
                  </span>
                  <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-bold text-brand-dark">
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
                  href={`/hp/services/${s.slug}`}
                  className="mt-6 inline-flex items-center gap-1.5 self-start rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
                >
                  詳しく見る
                  <ArrowIcon className="h-4 w-4" />
                </Link>
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
