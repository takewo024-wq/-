import type { IconName } from "../_components/icons";

/* =========================================================
   ホームページ全体で使う情報を、この1ファイルにまとめています。
   ★実在の「生活介護・放課後等デイサービス めいと」の公開情報を反映。
   ※ 未確認の項目（対象年齢・定員・料金・営業日・送迎など）は「要確認」と明記し、
     事実を勝手に決めていません。確定したら差し替えてください。
   ========================================================= */

export const SITE_NAME = "めいと";
export const ORG_NAME = "一般社団法人めいと";
export const SITE_FULL = "生活介護・放課後等デイサービス めいと";

// 連絡先・アクセス（実情報）
export const CONTACT = {
  tel: "078-762-3537",
  email: "mate.1212.tomomee@gmail.com",
  postal: "〒650-0017",
  address: "神戸市中央区楠町三丁目3-17 大倉山壱番館101",
  access: "地下鉄・大倉山駅から徒歩2分",
  hours: "平日 9:00〜18:00（※要確認）",
};

// 本文を中央にそろえる横幅（共通）
export const CONTAINER = "mx-auto w-full max-w-6xl px-5";

// 上部メニュー（各ページへのリンク）
export const NAV: { label: string; href: string }[] = [
  { label: "サービス", href: "/services" },
  { label: "お知らせ", href: "/news" },
  { label: "採用情報", href: "/recruit" },
  { label: "お問い合わせ", href: "/#contact" },
];

/* ---------------- サービス ---------------- */
export type Service = {
  slug: string;
  icon: IconName;
  image: string;
  tag: string;
  title: string;
  summary: string;
  points: string[];
  lead: string;
  details: { label: string; value: string }[];
  activities: string[];
};

export const SERVICES: Service[] = [
  {
    slug: "houkago-day",
    icon: "backpack",
    image: "/hp-media/service-houkago-day.png",
    tag: "放課後等デイサービス",
    title: "重症心身障がい児のための放課後の居場所",
    summary:
      "重症心身障がいのあるお子さまの、放課後や休日の居場所です。看護師が常駐し、医療的ケアにも対応します。",
    points: ["重症心身障がい児向け（重心型）", "看護師常駐・医療的ケア対応", "PT・OTによる機能訓練"],
    lead: "重症心身障がいのあるお子さまのための放課後等デイサービスです。看護師が常駐し、PT・OTによる機能訓練や個別メニューの運動を通して、一人ひとりに手厚い支援を行います。",
    details: [
      { label: "対象", value: "重症心身障がいのあるお子さま（対象年齢は要確認）" },
      { label: "医療的ケア", value: "看護師が常駐し対応します" },
      { label: "機能訓練", value: "PT・OTによる機能訓練、個別メニューの身体運動" },
      { label: "利用できる日", value: "要確認" },
      { label: "送迎", value: "要確認" },
      { label: "ご利用料金", value: "障害児通所給付費の対象（自己負担の上限は所得により異なります・要確認）" },
    ],
    activities: [
      "来所・健康チェック",
      "PT・OTによる機能訓練",
      "個別メニューの身体運動",
      "遊び・季節の活動",
    ],
  },
  {
    slug: "seikatsu-kaigo",
    icon: "heart",
    image: "/hp-media/service-seikatsu-kaigo.png",
    tag: "生活介護",
    title: "重症心身障がいのある方の日中活動の場",
    summary:
      "重症心身障がいのある方が、日中を安心して過ごせる活動の場です。看護師が常駐し、医療的ケアに対応します。",
    points: ["重症心身障がいのある方向け", "看護師常駐・医療的ケア対応", "一人ひとりに手厚い支援"],
    lead: "重症心身障がいのある方のための生活介護です。看護師が常駐し、機能訓練や日中活動を通して、安心して過ごせる毎日を支えます。",
    details: [
      { label: "対象", value: "重症心身障がいのある方（18歳以上／詳細は要確認）" },
      { label: "医療的ケア", value: "看護師が常駐し対応します" },
      { label: "機能訓練", value: "PT・OTによる機能訓練、個別メニューの身体運動" },
      { label: "利用できる日", value: "要確認" },
      { label: "送迎", value: "要確認" },
      { label: "ご利用料金", value: "介護給付費の対象（自己負担の上限は所得により異なります・要確認）" },
    ],
    activities: [
      "健康チェック・体調管理",
      "PT・OTによる機能訓練",
      "個別メニューの身体運動",
      "創作・音楽などの日中活動",
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
    body: "看護師が常駐しているので、医療的ケアが必要な方も安心して通っていただけます。",
    icon: "stethoscope",
  },
  {
    title: "PT・OTによる機能訓練",
    body: "理学療法士・作業療法士による機能訓練や、個別メニューの身体運動を行います。",
    icon: "plan",
  },
  {
    title: "一人ひとりに手厚い支援",
    body: "個別の支援が得意なスタッフが、その方に合わせたていねいな支援を行います。",
    icon: "heart",
  },
  {
    title: "大倉山駅から徒歩2分",
    body: "地下鉄・大倉山駅から徒歩2分。通いやすい場所にあります。",
    icon: "shield",
  },
];

/* ---------------- 一日の流れ ---------------- */
export const FLOW: { time: string; title: string; body: string }[] = [
  { time: "お迎え", title: "ご自宅・学校へ", body: "お迎えにあがります（送迎は要確認）。" },
  { time: "来所", title: "健康チェック", body: "体温・体調を確認し、水分補給。" },
  { time: "日中", title: "機能訓練・活動", body: "PT・OTの機能訓練や個別の運動、活動を。" },
  { time: "休息", title: "おやつ・休息", body: "ゆったりと過ごす時間です。" },
  { time: "お送り", title: "ご自宅へ", body: "ご自宅までお送りします（送迎は要確認）。" },
];

/* ---------------- お知らせ ---------------- */
export type NewsItem = {
  slug: string;
  date: string;
  cat: string;
  title: string;
  body: string[];
};

export const NEWS: NewsItem[] = [
  {
    slug: "jigyosho-hyoka-2025",
    date: "2025.01",
    cat: "お知らせ",
    title: "2025年 事業所評価を公開しました",
    body: [
      "いつもめいとの活動にご協力いただきありがとうございます。",
      "事業所の自己評価アンケートの結果を掲載します。2025年1月からの1年間、さまざまなことがありました。たくさんの方にめいとを知っていただけて嬉しいです。",
      "※ この記事は実サイトの情報をもとにした下書きです。本文は差し替えてください。",
    ],
  },
  {
    slug: "kengaku-annai",
    date: "2025.04",
    cat: "お知らせ",
    title: "見学・体験のご案内（仮）",
    body: [
      "めいとでは、見学・体験を随時受け付けています。（仮）",
      "お電話またはお問い合わせフォームより、お気軽にご連絡ください。",
    ],
  },
  {
    slug: "saiyo-boshu",
    date: "2025.05",
    cat: "採用",
    title: "保育士・児童指導員・看護師・ドライバーを募集しています（仮）",
    body: [
      "一緒に働いてくださる仲間を募集しています。（仮）",
      "詳しくは採用情報ページをご覧ください。",
    ],
  },
];

export function getNews(slug: string): NewsItem | undefined {
  return NEWS.find((n) => n.slug === slug);
}

/* ---------------- 採用（募集職種） ---------------- */
export const JOBS: { title: string; body: string }[] = [
  { title: "保育士・児童指導員", body: "お子さまの活動・遊び・個別支援を行います。" },
  { title: "看護師", body: "日中の健康管理と医療的ケアを担当します。" },
  { title: "ドライバー", body: "ご利用者の送迎を担当します。" },
];
