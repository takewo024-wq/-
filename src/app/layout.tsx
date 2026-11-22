import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// 日本語がきれいに表示される定番フォント（参考サイトと同じ Noto Sans JP）
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "生活介護・放課後等デイサービス めいと | 神戸市中央区・大倉山",
  description:
    "神戸市中央区の生活介護・放課後等デイサービス「めいと」。重症心身障がい児・者向けの重心型通所施設です。看護師が常駐し医療的ケアに対応、PT・OTによる機能訓練で一人ひとりに手厚い支援を行います。大倉山駅から徒歩2分。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
