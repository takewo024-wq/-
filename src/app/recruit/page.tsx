import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CONTAINER, CONTACT, JOBS } from "../_lib/site";
import {
  SiteHeader,
  SiteFooter,
  PageHeader,
  SectionLabel,
} from "../_components/site-chrome";
import { CheckIcon } from "../_components/icons";

export const metadata: Metadata = {
  title: "採用情報 | めいと",
  description: "看護師・児童指導員・生活支援員などを募集しています（仮の内容です）。",
};

// 応募の流れ（仮）
const STEPS = [
  { step: "01", title: "お問い合わせ", body: "お電話またはフォームからご連絡ください。" },
  { step: "02", title: "見学・面談", body: "事業所を見ていただき、お話をうかがいます。" },
  { step: "03", title: "選考", body: "面接を行います。（仮）" },
  { step: "04", title: "採用・入職", body: "研修からスタート。しっかりサポートします。" },
];

export default function RecruitPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />
      <main>
        <PageHeader
          title="採用情報"
          lead="子どもたちの「できた」を、いっしょに支えてくださる仲間を募集しています。"
          crumbs={[{ label: "ホーム", href: "/" }, { label: "採用情報" }]}
        />

        {/* メッセージ */}
        <section className={`${CONTAINER} py-14 text-center md:py-20`}>
          <SectionLabel>私たちと働きませんか</SectionLabel>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-[1.9] md:text-xl">
            資格や経験よりも、「寄り添う気持ち」を大切にしています。
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-ink-soft">
            未経験の方も、研修とチームでしっかりサポートします。
            一人ひとりのお子さま・ご利用者の毎日を、いっしょに支えてくれる方をお待ちしています。（仮）
          </p>
          <div className="relative mx-auto mt-10 aspect-[3/1] max-w-3xl overflow-hidden rounded-3xl bg-brand-tint2 ring-1 ring-brand/15">
            <Image
              src="/hp-media/recruit.png"
              alt="両手で包むハートをあしらった採用イメージのイラスト（仮）"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </section>

        {/* 募集職種 */}
        <section className="bg-brand-tint py-14 md:py-20">
          <div className={CONTAINER}>
            <div className="text-center">
              <SectionLabel>募集職種</SectionLabel>
              <h2 className="mt-4 text-2xl font-bold md:text-3xl">募集している職種</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {JOBS.map((j) => (
                <div
                  key={j.title}
                  className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5"
                >
                  <h3 className="text-lg font-bold">{j.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink-soft">{j.body}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>雇用形態：正社員・パート（仮）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>勤務時間：応相談（仮）</span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 応募の流れ */}
        <section className={`${CONTAINER} py-14 md:py-20`}>
          <div className="text-center">
            <SectionLabel>応募の流れ</SectionLabel>
            <h2 className="mt-4 text-2xl font-bold md:text-3xl">ご応募から入職まで</h2>
          </div>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li
                key={s.step}
                className="rounded-2xl border border-black/5 bg-brand-tint2 p-6"
              >
                <span className="text-2xl font-bold text-brand">{s.step}</span>
                <h3 className="mt-2 text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 応募CTA */}
        <section className="bg-brand py-14 text-white">
          <div className={`${CONTAINER} text-center`}>
            <h2 className="text-xl font-bold md:text-2xl">まずは見学・お問い合わせから</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/90">
              「話を聞いてみたい」だけでも大歓迎です。お気軽にご連絡ください。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/#contact"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-brand-dark shadow-md transition hover:bg-brand-tint"
              >
                応募・お問い合わせへ
              </Link>
              <a
                href={`tel:${CONTACT.tel.replace(/-/g, "")}`}
                className="rounded-full border border-white/60 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                {CONTACT.tel}
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
