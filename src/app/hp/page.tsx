import Link from "next/link";
import {
  SITE_NAME,
  CONTAINER,
  SERVICES,
  FEATURES,
  FLOW,
  NEWS,
} from "./_lib/site";
import { SiteHeader, SiteFooter, SectionLabel } from "./_components/site-chrome";
import {
  Icon,
  SunIcon,
  CheckIcon,
  ArrowIcon,
  PhoneIcon,
  PinIcon,
} from "./_components/icons";

/*
 * トップページ（概要を見せ、各専用ページへ誘導する「掘り下げ式」の入口）
 * 詳しい内容は /hp/services, /hp/news, /hp/recruit の各ページへ。
 */

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <div className="bg-brand-deep text-center text-[12px] leading-relaxed text-white/95 px-4 py-2">
        ※ これはデザインの下書きです。写真・文章・事業所名・電話番号などはすべて
        <span className="font-bold">仮の内容</span>で、後から差し替えられます。
      </div>

      <SiteHeader />

      <main>
        <Hero />
        <Philosophy />
        <Services />
        <Features />
        <DailyFlow />
        <News />
        <Recruit />
        <Contact />
      </main>

      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-brand-tint2">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand/10 blur-2xl" />

      <div className={`${CONTAINER} relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24`}>
        <div>
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand-dark">
            重症心身障がいのあるお子さま・方への支援
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-[1.35] tracking-wide md:text-[44px] md:leading-[1.3]">
            「できた」が、
            <br className="hidden sm:block" />
            うまれる場所。
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-8 text-ink-soft">
            医療的ケアが必要なお子さまも、安心して過ごせる居場所を。
            放課後等デイサービスと生活介護で、一人ひとりのペースに寄り添い、
            ご本人とご家族の毎日を支えます。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#contact"
              className="rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-dark"
            >
              見学・ご相談はこちら
            </Link>
            <Link
              href="/hp/services"
              className="rounded-full border border-brand/40 bg-white px-7 py-3.5 text-sm font-bold text-brand-dark transition hover:bg-brand-tint"
            >
              サービスを見る
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-gradient-to-br from-brand/20 to-brand/5 ring-1 ring-brand/15">
            <div className="text-center text-ink-soft">
              <SunIcon className="mx-auto h-14 w-14 text-brand" />
              <p className="mt-3 text-sm">ここにメインの写真が入ります（仮）</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  return (
    <section className={`${CONTAINER} py-16 text-center md:py-20`}>
      <SectionLabel>私たちの想い</SectionLabel>
      <p className="mx-auto mt-6 max-w-2xl text-xl font-bold leading-[2] tracking-wide md:text-[26px] md:leading-[2]">
        その子らしい一日を、いっしょに。
      </p>
      <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-ink-soft">
        どんなに重い障がいがあっても、笑顔で過ごせる時間は必ずあります。
        私たち{SITE_NAME}は、お子さま・ご利用者お一人おひとりの「できる」を一緒に見つけ、
        ご家族がほっと一息つける場所でありたいと考えています。
        医療と福祉の専門職がチームとなり、安心・安全を第一に支援します。
      </p>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="bg-brand-tint py-16 md:py-20">
      <div className={CONTAINER}>
        <div className="text-center">
          <SectionLabel>サービス紹介</SectionLabel>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">2つのサービスで支えます</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
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
              <h3 className="mt-5 text-lg font-bold leading-relaxed">{s.title}</h3>
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
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className={`${CONTAINER} py-16 md:py-20`}>
      <div className="text-center">
        <SectionLabel>選ばれる理由</SectionLabel>
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">安心して任せていただくために</h2>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-black/5 bg-brand-tint2 p-6 transition hover:border-brand/30"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-brand ring-1 ring-brand/15">
              <Icon name={f.icon} className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-bold leading-relaxed">{f.title}</h3>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DailyFlow() {
  return (
    <section id="flow" className="bg-brand-tint2 py-16 md:py-20">
      <div className={CONTAINER}>
        <div className="text-center">
          <SectionLabel>一日の流れ</SectionLabel>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">
            放課後等デイサービスの一日（例）
          </h2>
        </div>
        <ol className="relative mx-auto mt-12 max-w-2xl border-l-2 border-brand/25 pl-8">
          {FLOW.map((f) => (
            <li key={f.time} className="relative pb-9 last:pb-0">
              <span className="absolute -left-[41px] grid h-8 w-8 place-items-center rounded-full bg-brand text-[11px] font-bold text-white ring-4 ring-brand-tint2">
                ●
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-bold text-brand-dark">{f.time}</span>
                <span className="text-base font-bold">{f.title}</span>
              </div>
              <p className="mt-1 text-sm leading-7 text-ink-soft">{f.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function News() {
  return (
    <section id="news" className={`${CONTAINER} py-16 md:py-20`}>
      <div className="flex items-end justify-between">
        <div>
          <SectionLabel>お知らせ</SectionLabel>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">新着情報</h2>
        </div>
        <Link href="/hp/news" className="text-sm font-bold text-brand-dark hover:underline">
          一覧を見る →
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-black/5 border-y border-black/5">
        {NEWS.map((n) => (
          <li key={n.slug}>
            <Link
              href={`/hp/news/${n.slug}`}
              className="flex flex-col gap-1.5 py-5 transition hover:bg-brand-tint2 sm:flex-row sm:items-center sm:gap-5"
            >
              <span className="text-sm text-ink-soft">{n.date}</span>
              <span className="inline-block w-fit rounded-full bg-brand-tint px-3 py-0.5 text-xs font-bold text-brand-dark">
                {n.cat}
              </span>
              <span className="text-[15px] font-medium">{n.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Recruit() {
  return (
    <section id="recruit" className="bg-brand py-16 text-white md:py-20">
      <div className={`${CONTAINER} grid items-center gap-8 md:grid-cols-[1.4fr_1fr]`}>
        <div>
          <SectionLabel className="text-white/80">採用情報</SectionLabel>
          <h2 className="mt-4 text-2xl font-bold leading-relaxed md:text-3xl">
            子どもたちの「できた」を、
            <br className="hidden sm:block" />
            いっしょに支えませんか。
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-8 text-white/90">
            看護師・児童指導員・保育士・生活支援員を募集しています。
            資格や経験がなくても、研修でしっかりサポートします。（仮）
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/hp/recruit"
            className="rounded-full bg-white px-7 py-3.5 text-center text-sm font-bold text-brand-dark shadow-md transition hover:bg-brand-tint"
          >
            採用情報を見る
          </Link>
          <Link
            href="#contact"
            className="rounded-full border border-white/60 px-7 py-3.5 text-center text-sm font-bold text-white transition hover:bg-white/10"
          >
            見学・お問い合わせ
          </Link>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className={`${CONTAINER} py-16 md:py-20`}>
      <div className="text-center">
        <SectionLabel>お問い合わせ・アクセス</SectionLabel>
        <h2 className="mt-4 text-2xl font-bold md:text-3xl">見学・ご相談はお気軽に</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-soft">
          「どんな様子か見てみたい」「うちの子は利用できる？」など、
          どんなことでもお気軽にご相談ください。
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-black/5 bg-brand-tint2 p-8">
          <dl className="space-y-5">
            <ContactRow icon={<PhoneIcon className="h-5 w-5" />} label="お電話">
              <a href="tel:0000000000" className="text-2xl font-bold text-brand-dark">
                000-000-0000
              </a>
              <p className="mt-1 text-xs text-ink-soft">受付時間：平日 9:00〜18:00（仮）</p>
            </ContactRow>
            <ContactRow icon={<PinIcon className="h-5 w-5" />} label="所在地">
              〒000-0000
              <br />
              ◯◯県◯◯市◯◯町 0-0-0（仮）
            </ContactRow>
          </dl>
          <a
            href="mailto:info@example.com"
            className="mt-7 block rounded-full bg-brand px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            メールでお問い合わせ
          </a>
        </div>

        <div className="grid min-h-[260px] place-items-center rounded-3xl bg-gradient-to-br from-brand/15 to-brand/5 ring-1 ring-brand/15">
          <div className="text-center text-ink-soft">
            <PinIcon className="mx-auto h-10 w-10 text-brand" />
            <p className="mt-3 text-sm">ここに地図が入ります（仮）</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white">
        {icon}
      </span>
      <div>
        <dt className="text-xs font-bold text-ink-soft">{label}</dt>
        <dd className="mt-1 text-sm leading-7 text-ink">{children}</dd>
      </div>
    </div>
  );
}
