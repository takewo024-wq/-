import Link from "next/link";
import { SITE_NAME, CONTAINER, NAV } from "../_lib/site";
import { LeafIcon } from "./icons";

/* =========================================================
   上部メニュー（全ページ共通）※スマホは details で開閉
   ========================================================= */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className={`${CONTAINER} flex items-center justify-between gap-4 py-3`}>
        <Link href="/" className="flex items-center gap-2.5">
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
          {NAV.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink transition hover:text-brand-dark"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark"
          >
            見学・ご相談
          </Link>
        </nav>

        {/* スマホ用メニュー */}
        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full bg-brand px-4 py-2 text-sm font-bold text-white">
            メニュー
          </summary>
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border-b border-black/5 px-4 py-3 text-sm hover:bg-brand-tint"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}

/* =========================================================
   フッター（全ページ共通）
   ========================================================= */
export function SiteFooter() {
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
            <li><Link href="/services/houkago-day" className="hover:text-white">放課後等デイサービス</Link></li>
            <li><Link href="/services/seikatsu-kaigo" className="hover:text-white">生活介護</Link></li>
            <li><Link href="/services" className="hover:text-white">サービス一覧</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold">事業所</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li><Link href="/news" className="hover:text-white">お知らせ</Link></li>
            <li><Link href="/recruit" className="hover:text-white">採用情報</Link></li>
            <li><Link href="/#contact" className="hover:text-white">お問い合わせ</Link></li>
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
   小さな共通部品
   ========================================================= */
export function SectionLabel({
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

/* サブページ上部の見出し帯（パンくず付き） */
export function PageHeader({
  title,
  lead,
  crumbs,
}: {
  title: string;
  lead?: string;
  crumbs: { label: string; href?: string }[];
}) {
  return (
    <section className="border-b border-black/5 bg-brand-tint">
      <div className={`${CONTAINER} py-10 md:py-14`}>
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {c.href ? (
                <Link href={c.href} className="hover:text-brand-dark">{c.label}</Link>
              ) : (
                <span className="text-ink">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <span className="text-ink-soft/50">/</span>}
            </span>
          ))}
        </nav>
        <h1 className="mt-3 text-2xl font-bold md:text-3xl">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft">{lead}</p>}
      </div>
    </section>
  );
}

/* お問い合わせへの共通の誘導ブロック */
export function ContactCta() {
  return (
    <section className="bg-brand py-14 text-white">
      <div className={`${CONTAINER} text-center`}>
        <h2 className="text-xl font-bold md:text-2xl">見学・ご相談はお気軽に</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/90">
          「見てみたい」「うちの子は利用できる？」など、どんなことでもご相談ください。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/#contact"
            className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-brand-dark shadow-md transition hover:bg-brand-tint"
          >
            お問い合わせへ
          </Link>
          <a
            href="tel:0000000000"
            className="rounded-full border border-white/60 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            000-000-0000（仮）
          </a>
        </div>
      </div>
    </section>
  );
}
