import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

// 日本語がきれいに表示される定番フォント。参考サイトと同じ Noto Sans JP を使用。
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "児童発達支援・生活介護 ◯◯（仮） | 重症心身障がいのお子さま・方へ",
  description:
    "重症心身障がいに対応した放課後等デイサービスと生活介護の事業所です（※施設名・内容は仮の内容です）。看護師による医療的ケア、送迎、一人ひとりに合わせた個別支援で、ご本人とご家族に寄り添います。",
};

export default function HpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${notoSansJP.variable} font-jp bg-white text-ink`}>
      {children}
    </div>
  );
}
