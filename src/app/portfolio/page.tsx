import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "動画編集ポートフォリオ",
  description: "動画編集の副業ポートフォリオサイト",
};

const services = [
  {
    title: "YouTube長編動画編集",
    price: "¥8,000〜 / 本",
    desc: "カット編集、テロップ、BGM・効果音、簡単なモーショングラフィックス",
  },
  {
    title: "Shorts / TikTok / Reels編集",
    price: "¥3,000〜 / 本",
    desc: "縦動画のテンポ編集、字幕、トレンドに合わせたテロップ演出",
  },
  {
    title: "VP・会社紹介動画",
    price: "¥30,000〜 / 本",
    desc: "構成提案、カラーグレーディング、ナレーション調整、BGM選定",
  },
  {
    title: "Vlog・イベント動画",
    price: "¥10,000〜 / 本",
    desc: "ストーリー構成、色補正、テロップ・字幕入れ",
  },
];

const works = [
  { title: "作品タイトル 1", category: "YouTube長編" },
  { title: "作品タイトル 2", category: "Shorts" },
  { title: "作品タイトル 3", category: "VP・企業紹介" },
  { title: "作品タイトル 4", category: "Vlog" },
  { title: "作品タイトル 5", category: "YouTube長編" },
  { title: "作品タイトル 6", category: "Shorts" },
];

const skills = [
  "DaVinci Resolve",
  "Adobe Premiere Pro",
  "Adobe After Effects",
  "CapCut",
  "Photoshop",
];

const steps = [
  { step: "01", title: "お問い合わせ", desc: "フォームまたはメールで内容・納期・予算をご相談ください。" },
  { step: "02", title: "お見積り・ご発注", desc: "内容確認の上お見積りを提示。合意後に素材をお預かりします。" },
  { step: "03", title: "編集・初稿提出", desc: "構成に沿って編集し、初稿をご確認いただきます。" },
  { step: "04", title: "修正・納品", desc: "修正対応後、指定形式で納品します(修正2回まで無料)。" },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="border-b border-black/10 dark:border-white/10 px-6 py-20 text-center">
        <p className="text-sm tracking-widest uppercase opacity-60 mb-3">
          Video Editor Portfolio
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">お名前 / 屋号</h1>
        <p className="max-w-xl mx-auto opacity-80 leading-relaxed">
          YouTube・Shorts・企業VPなど、目的に合わせた動画編集を承っています。
          テンポの良い編集と見やすいテロップ設計で、最後まで見てもらえる動画に仕上げます。
        </p>
        <div className="mt-8">
          <a
            href="#contact"
            className="inline-block rounded-lg bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            お問い合わせ
          </a>
        </div>
      </section>

      {/* Skills */}
      <section className="px-6 py-12 border-b border-black/10 dark:border-white/10">
        <h2 className="text-xl font-semibold mb-6 text-center">使用ツール</h2>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {skills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-black/10 dark:border-white/20 px-4 py-1.5 text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Works */}
      <section className="px-6 py-16 border-b border-black/10 dark:border-white/10">
        <h2 className="text-2xl font-semibold mb-2 text-center">実績</h2>
        <p className="text-center opacity-60 text-sm mb-10">
          ここに納品済み動画のサムネイルやリンクを差し込んでください
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {works.map((w, i) => (
            <div
              key={i}
              className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden"
            >
              <div className="aspect-video bg-black/5 dark:bg-white/5 flex items-center justify-center text-sm opacity-40">
                サムネイル / 埋め込み動画
              </div>
              <div className="p-4">
                <div className="text-xs opacity-60 mb-1">{w.category}</div>
                <div className="font-medium">{w.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services / Pricing */}
      <section className="px-6 py-16 border-b border-black/10 dark:border-white/10">
        <h2 className="text-2xl font-semibold mb-10 text-center">料金プラン</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-black/10 dark:border-white/10 p-6"
            >
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <div className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                {s.price}
              </div>
              <p className="text-sm opacity-70 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs opacity-50 mt-6">
          ※ 価格は目安です。動画尺・素材量・修正回数により変動します。
        </p>
      </section>

      {/* Process */}
      <section className="px-6 py-16 border-b border-black/10 dark:border-white/10">
        <h2 className="text-2xl font-semibold mb-10 text-center">ご依頼の流れ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((s) => (
            <div key={s.step}>
              <div className="text-3xl font-bold opacity-20 mb-2">{s.step}</div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm opacity-70 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold mb-3">お問い合わせ</h2>
        <p className="opacity-70 mb-8">
          ご依頼・お見積りのご相談はお気軽にご連絡ください。
        </p>
        <a
          href="mailto:example@example.com"
          className="inline-block rounded-lg bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
        >
          メールで問い合わせる
        </a>
        <p className="text-xs opacity-50 mt-6">
          X (Twitter) / Instagram などのSNSリンクもここに追加できます
        </p>
      </section>
    </div>
  );
}
