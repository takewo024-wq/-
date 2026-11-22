import type { IconName } from "../_components/icons";

/* =========================================================
   ホームページ全体で使う情報を、この1ファイルにまとめています。
   ★差し替え：ここを直すと全ページに反映されます。
   ========================================================= */

// ★差し替え：事業所名（仮）
export const SITE_NAME = "ひだまり";

// 本文を中央にそろえる横幅（共通）
export const CONTAINER = "mx-auto w-full max-w-6xl px-5";

// 上部メニュー（各ページへのリンク）
export const NAV: { label: string; href: string }[] = [
  { label: "サービス", href: "/hp/services" },
  { label: "お知らせ", href: "/hp/news" },
  { label: "採用情報", href: "/hp/recruit" },
  { label: "お問い合わせ", href: "/hp#contact" },
];

/* ---------------- サービス ---------------- */
export type Service = {
  slug: string;
  icon: IconName;
  image: string; // カードや詳細ページで使うイラスト（仮）
  tag: string;
  title: string;
  summary: string; // トップのカード用の短い説明
  points: string[]; // トップのカード用の箇条書き
  lead: string; // 詳細ページ冒頭のリード文
  details: { label: string; value: string }[]; // 詳細ページの表
  activities: string[]; // 活動・支援の内容
};

// ★差し替え：サービスの内容（仮）
export const SERVICES: Service[] = [
  {
    slug: "houkago-day",
    icon: "backpack",
    image: "/hp-media/service-houkago-day.png",
    tag: "放課後等デイサービス",
    title: "重症心身障がい児に対応した放課後の居場所",
    summary:
      "学校やご自宅への送迎つき。看護師による医療的ケアに対応し、遊び・活動・機能訓練を通して「できた」を少しずつ増やしていきます。",
    points: ["対象：就学児〜18歳（仮）", "平日の放課後・学校休業日", "送迎あり／医療的ケア対応"],
    lead: "学校の放課後や休業日に、お子さまが安心して過ごせる居場所です。看護師が常駐し、医療的ケアが必要なお子さまもご利用いただけます。（仮）",
    details: [
      { label: "対象", value: "就学児〜18歳の重症心身障がい児（仮）" },
      { label: "利用できる日", value: "平日の放課後・土曜・長期休暇（仮）" },
      { label: "定員", value: "1日◯名（仮）" },
      { label: "送迎", value: "学校・ご自宅への送迎あり（仮）" },
      { label: "医療的ケア", value: "看護師が対応（喀痰吸引・経管栄養など）（仮）" },
      { label: "ご利用料金", value: "障害児通所給付費の対象。自己負担は世帯の所得に応じて上限があります（仮）" },
    ],
    activities: [
      "健康チェック・水分補給",
      "個別の遊び・感覚あそび",
      "機能訓練・リハビリ的な活動",
      "季節の行事・創作活動",
    ],
  },
  {
    slug: "seikatsu-kaigo",
    icon: "heart",
    image: "/hp-media/service-seikatsu-kaigo.png",
    tag: "生活介護",
    title: "日中を安心して過ごせる活動の場",
    summary:
      "食事・入浴・排せつの支援や機能訓練に加え、創作活動や外出など、その方に合った日中活動をご用意します。",
    points: ["対象：18歳以上（仮）", "平日の日中", "個別支援計画にそった活動"],
    lead: "18歳以上の方が、日中を安心して過ごせる活動の場です。お一人おひとりの状態に合わせ、生活の支援と活動を行います。（仮）",
    details: [
      { label: "対象", value: "18歳以上で常時介護を必要とする方（仮）" },
      { label: "利用できる日", value: "平日の日中（仮）" },
      { label: "定員", value: "1日◯名（仮）" },
      { label: "送迎", value: "ご自宅への送迎あり（仮）" },
      { label: "医療的ケア", value: "看護師が対応（仮）" },
      { label: "ご利用料金", value: "介護給付費の対象。自己負担は所得に応じて上限があります（仮）" },
    ],
    activities: [
      "食事・入浴・排せつの支援",
      "機能訓練・健康管理",
      "創作活動・音楽・リラクゼーション",
      "外出・季節の行事",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/* ---------------- 選ばれる理由（特長） ---------------- */
export const FEATURES: { title: string; body: string; icon: IconName }[] = [
  {
    title: "看護師が常駐・医療的ケアに対応",
    body: "喀痰吸引や経管栄養など、医療的ケアが必要な方も安心してご利用いただけます。（仮）",
    icon: "stethoscope",
  },
  {
    title: "送迎サービスあり",
    body: "学校やご自宅まで送迎します。ご家族の負担をやわらげます。（仮）",
    icon: "car",
  },
  {
    title: "一人ひとりの個別支援計画",
    body: "ご本人・ご家族と相談しながら、その方に合った目標と支援を考えます。（仮）",
    icon: "plan",
  },
  {
    title: "安全・バリアフリーな環境",
    body: "車いすや医療機器にも配慮した、安全で過ごしやすい空間です。（仮）",
    icon: "shield",
  },
];

/* ---------------- 一日の流れ ---------------- */
export const FLOW: { time: string; title: string; body: string }[] = [
  { time: "14:00", title: "お迎え", body: "学校やご自宅へお迎えにあがります。" },
  { time: "15:00", title: "来所・健康チェック", body: "体温・体調を確認し、水分補給。" },
  { time: "15:30", title: "活動・機能訓練", body: "遊びや創作、その子に合った活動を。" },
  { time: "16:30", title: "おやつ・休息", body: "ゆったりと過ごす時間です。" },
  { time: "17:00", title: "お送り", body: "ご自宅までお送りします。" },
];

/* ---------------- お知らせ ---------------- */
export type NewsItem = {
  slug: string;
  date: string;
  cat: string;
  title: string;
  body: string[]; // 段落ごとの本文
};

// ★差し替え：お知らせ（仮）
export const NEWS: NewsItem[] = [
  {
    slug: "winter-open-house",
    date: "2026.11.20",
    cat: "お知らせ",
    title: "冬の見学会を開催します（仮）",
    body: [
      "日ごろより当事業所の活動にご理解をいただき、ありがとうございます。（仮）",
      "この冬、事業所の様子をご覧いただける見学会を開催します。実際の活動や設備、医療的ケアの体制などを、スタッフがご案内します。",
      "ご希望の方は、お電話またはお問い合わせフォームよりお気軽にお申し込みください。",
    ],
  },
  {
    slug: "recruit-nurse",
    date: "2026.10.05",
    cat: "採用",
    title: "看護師・児童指導員を募集しています（仮）",
    body: [
      "現在、看護師および児童指導員を募集しています。（仮）",
      "資格や経験がなくても、研修でしっかりサポートします。子どもたちの「できた」を一緒に支えてくださる方をお待ちしています。",
      "詳しくは採用情報ページをご覧ください。",
    ],
  },
  {
    slug: "summer-festival",
    date: "2026.09.01",
    cat: "行事",
    title: "夏祭りを開催しました（仮）",
    body: [
      "先日、事業所で夏祭りを開催しました。（仮）",
      "ご利用者・ご家族のみなさまと一緒に、ゲームや出し物で楽しいひとときを過ごしました。たくさんの笑顔に出会えた一日でした。",
    ],
  },
];

export function getNews(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}

/* ---------------- 採用（募集職種） ---------------- */
export const JOBS: { title: string; body: string }[] = [
  { title: "看護師", body: "日中の健康管理と医療的ケアを担当します。（仮）" },
  { title: "児童指導員・保育士", body: "お子さまの活動・遊び・支援を行います。（仮）" },
  { title: "生活支援員", body: "生活介護での日中活動と介助を行います。（仮）" },
];
