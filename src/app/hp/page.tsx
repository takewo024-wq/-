import Link from "next/link";

/*
 * 介護・障がい福祉事業所のホームページ（トップページ）
 * - サービス内容：重症心身障がい児対応の「放課後等デイサービス」＋「生活介護」
 * - 参考サイト（社会福祉法人 功有会 / やまと園）の「デザインの型」のみを踏襲し、
 *   写真・文章・事業所名・連絡先はすべて仮の内容（オリジナル）。後から差し替え可能。
 *
 * ▼差し替えポイントは「★差し替え」コメントを目印にしてください。
 */

// ★差し替え：事業所名（仮）
const SITE_NAME = "ひだまり";

// ★差し替え：グローバルメニュー（ページ内の各セクションへ移動）
const NAV = [
  { label: "サービス", href: "#services" },
  { label: "選ばれる理由", href: "#features" },
  { label: "一日の流れ", href: "#flow" },
  { label: "お知らせ", href: "#news" },
  { label: "採用情報", href: "#recruit" },
];

const CONTAINER = "mx-auto w-full max-w-6xl px-5";

export default function Page() {
  return (
    <div className="min-h-screen bg-white text-ink">
      {/* 仮の内容であることのお知らせ（差し替え後に削除してください） */}
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

/* =========================================================
   ヘッダー（上部メニュー）※スマホは details でメニュー開閉
   ========================================================= */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className={`${CONTAINER} flex items-center justify-between gap-4 py-3`}>
        {/* ロゴ */}
        <Link href="#top" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white">
            <LeafIcon className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-wide">{SITE_NAME}</span>
            <span className="block text-[11px] text-ink-soft">
              放課後等デイサービス・生活介護
            </span>
          </span>
        </Link>

        {/* PC用メニュー */}
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink transition hover:text-brand-dark"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark"
          >
            見学・ご相談
          </a>
        </nav>

        {/* スマホ用メニュー */}
        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-bold text-white">
            メニュー
          </summary>
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block border-b border-black/5 px-4 py-3 text-sm hover:bg-brand-tint"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              className="block px-4 py-3 text-sm font-bold text-brand-dark hover:bg-brand-tint"
            >
              見学・ご相談はこちら
            </a>
          </div>
        </details>
      </div>
    </header>
  );
}

/* =========================================================
   ヒーロー（第一印象）
   ========================================================= */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-brand-tint2">
      {/* 背景のやわらかい装飾 */}
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
            ご本人とご家族の毎日を支えます。{/* ★差し替え：キャッチコピー */}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand-dark"
            >
              見学・ご相談はこちら
            </a>
            <a
              href="#services"
              className="rounded-full border border-brand/40 bg-white px-7 py-3.5 text-sm font-bold text-brand-dark transition hover:bg-brand-tint"
            >
              サービスを見る
            </a>
          </div>
        </div>

        {/* ★差し替え：メインの写真が入る場所 */}
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

/* =========================================================
   私たちの想い
   ========================================================= */
function Philosophy() {
  return (
    <section className={`${CONTAINER} py-16 text-center md:py-20`}>
      <SectionLabel>私たちの想い</SectionLabel>
      <p className="mx-auto mt-6 max-w-2xl text-xl font-bold leading-[2] tracking-wide md:text-[26px] md:leading-[2]">
        その子らしい一日を、いっしょに。
      </p>
      <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-ink-soft">
        {/* ★差し替え：理念・メッセージ本文 */}
        どんなに重い障がいがあっても、笑顔で過ごせる時間は必ずあります。
        私たち{SITE_NAME}は、お子さま・ご利用者お一人おひとりの「できる」を一緒に見つけ、
        ご家族がほっと一息つける場所でありたいと考えています。
        医療と福祉の専門職がチームとなり、安心・安全を第一に支援します。
      </p>
    </section>
  );
}

/* =========================================================
   サービス紹介
   ========================================================= */
const SERVICES = [
  {
    tag: "放課後等デイサービス",
    title: "重症心身障がい児に対応した放課後の居場所",
    body: "学校やご自宅への送迎つき。看護師による医療的ケアに対応し、遊び・活動・機能訓練を通して「できた」を少しずつ増やしていきます。",
    points: ["対象：就学児〜18歳（仮）", "平日の放課後・学校休業日", "送迎あり／医療的ケア対応"],
    icon: <BackpackIcon className="h-7 w-7" />,
  },
  {
    tag: "生活介護",
    title: "日中を安心して過ごせる活動の場",
    body: "食事・入浴・排せつの支援や機能訓練に加え、創作活動や外出など、その方に合った日中活動をご用意します。",
    points: ["対象：18歳以上（仮）", "平日の日中", "個別支援計画にそった活動"],
    icon: <HeartIcon className="h-7 w-7" />,
  },
];

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
              key={s.tag}
              className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/5 transition hover:shadow-md md:p-9"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white">
                  {s.icon}
                </span>
                <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-bold text-brand-dark">
                  {s.tag}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold leading-relaxed">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-ink-soft">{s.body}</p>
              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   選ばれる理由（特長）
   ========================================================= */
const FEATURES = [
  {
    title: "看護師が常駐・医療的ケアに対応",
    body: "喀痰吸引や経管栄養など、医療的ケアが必要な方も安心してご利用いただけます。（仮）",
    icon: <StethoscopeIcon className="h-6 w-6" />,
  },
  {
    title: "送迎サービスあり",
    body: "学校やご自宅まで送迎します。ご家族の負担をやわらげます。（仮）",
    icon: <CarIcon className="h-6 w-6" />,
  },
  {
    title: "一人ひとりの個別支援計画",
    body: "ご本人・ご家族と相談しながら、その方に合った目標と支援を考えます。（仮）",
    icon: <PlanIcon className="h-6 w-6" />,
  },
  {
    title: "安全・バリアフリーな環境",
    body: "車いすや医療機器にも配慮した、安全で過ごしやすい空間です。（仮）",
    icon: <ShieldIcon className="h-6 w-6" />,
  },
];

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
              {f.icon}
            </span>
            <h3 className="mt-4 text-base font-bold leading-relaxed">{f.title}</h3>
            <p className="mt-2 text-sm leading-7 text-ink-soft">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   一日の流れ（放課後等デイサービスの例）
   ========================================================= */
const FLOW = [
  { time: "14:00", title: "お迎え", body: "学校やご自宅へお迎えにあがります。" },
  { time: "15:00", title: "来所・健康チェック", body: "体温・体調を確認し、水分補給。" },
  { time: "15:30", title: "活動・機能訓練", body: "遊びや創作、その子に合った活動を。" },
  { time: "16:30", title: "おやつ・休息", body: "ゆったりと過ごす時間です。" },
  { time: "17:00", title: "お送り", body: "ご自宅までお送りします。" },
];

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

/* =========================================================
   お知らせ
   ========================================================= */
const NEWS = [
  { date: "2026.11.20", cat: "お知らせ", title: "冬の見学会を開催します（仮）" },
  { date: "2026.10.05", cat: "採用", title: "看護師・児童指導員を募集しています（仮）" },
  { date: "2026.09.01", cat: "行事", title: "夏祭りを開催しました（仮）" },
];

function News() {
  return (
    <section id="news" className={`${CONTAINER} py-16 md:py-20`}>
      <div className="flex items-end justify-between">
        <div>
          <SectionLabel>お知らせ</SectionLabel>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">新着情報</h2>
        </div>
        <a href="#" className="text-sm font-bold text-brand-dark hover:underline">
          一覧を見る →
        </a>
      </div>
      <ul className="mt-8 divide-y divide-black/5 border-y border-black/5">
        {NEWS.map((n) => (
          <li key={n.title}>
            <a
              href="#"
              className="flex flex-col gap-1.5 py-5 transition hover:bg-brand-tint2 sm:flex-row sm:items-center sm:gap-5"
            >
              <span className="text-sm text-ink-soft">{n.date}</span>
              <span className="inline-block w-fit rounded-full bg-brand-tint px-3 py-0.5 text-xs font-bold text-brand-dark">
                {n.cat}
              </span>
              <span className="text-[15px] font-medium">{n.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* =========================================================
   採用情報
   ========================================================= */
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
          <a
            href="#"
            className="rounded-full bg-white px-7 py-3.5 text-center text-sm font-bold text-brand-dark shadow-md transition hover:bg-brand-tint"
          >
            採用情報を見る
          </a>
          <a
            href="#contact"
            className="rounded-full border border-white/60 px-7 py-3.5 text-center text-sm font-bold text-white transition hover:bg-white/10"
          >
            見学・お問い合わせ
          </a>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   お問い合わせ・アクセス
   ========================================================= */
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
        {/* 連絡先 */}
        <div className="rounded-3xl border border-black/5 bg-brand-tint2 p-8">
          <dl className="space-y-5">
            <ContactRow icon={<PhoneIcon className="h-5 w-5" />} label="お電話">
              {/* ★差し替え：電話番号 */}
              <a href="tel:0000000000" className="text-2xl font-bold text-brand-dark">
                000-000-0000
              </a>
              <p className="mt-1 text-xs text-ink-soft">受付時間：平日 9:00〜18:00（仮）</p>
            </ContactRow>
            <ContactRow icon={<PinIcon className="h-5 w-5" />} label="所在地">
              {/* ★差し替え：住所 */}
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

        {/* ★差し替え：地図 */}
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

/* =========================================================
   フッター
   ========================================================= */
function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-brand-deep text-white/90">
      <div className={`${CONTAINER} grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-3`}>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
              <LeafIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">{SITE_NAME}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/75">
            放課後等デイサービス・生活介護
            <br />
            重症心身障がいのあるお子さま・方への支援（仮）
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold">サービス</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><a href="#services" className="hover:text-white">放課後等デイサービス</a></li>
            <li><a href="#services" className="hover:text-white">生活介護</a></li>
            <li><a href="#flow" className="hover:text-white">一日の流れ</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold">事業所</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><a href="#news" className="hover:text-white">お知らせ</a></li>
            <li><a href="#recruit" className="hover:text-white">採用情報</a></li>
            <li><a href="#contact" className="hover:text-white">お問い合わせ</a></li>
            <li><a href="#" className="hover:text-white">個人情報保護方針（仮）</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className={`${CONTAINER} py-5 text-center text-xs text-white/60`}>
          © 2026 {SITE_NAME}（仮）. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   小さな部品
   ========================================================= */
function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-xs font-bold uppercase tracking-[0.2em] text-brand-dark ${className}`}
    >
      {children}
    </span>
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

/* =========================================================
   アイコン（画像を使わず軽量に。すべてインラインSVG）
   ========================================================= */
type IconProps = { className?: string };

function LeafIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M11 20A7 7 0 0 1 4 13c0-6 5-9 13-10 1 8-2 14-9 15-2 .3-4 2-4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BackpackIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 9a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9a3 3 0 0 1 6 0M9 14h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5c0 5-7 9.5-7 9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function StethoscopeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 3v5a4 4 0 0 0 8 0V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 16a6 6 0 0 0 8 0v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18" cy="12" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function CarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 13l1.5-4A3 3 0 0 1 8.3 7h7.4a3 3 0 0 1 2.8 2l1.5 4M4 13h16v4H4v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="8" cy="17" r="1.6" fill="currentColor" />
      <circle cx="16" cy="17" r="1.6" fill="currentColor" />
    </svg>
  );
}
function PlanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9h6M9 13h6M9 17h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C10 22 2 14 3.5 5.6A1.5 1.5 0 0 1 5 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 21s-6-5-6-10a6 6 0 1 1 12 0c0 5-6 10-6 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
