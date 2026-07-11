import Script from "next/script";
import { ISP_MARKUP } from "@/lib/ispMarkup";
import "./isp.css";

// 個別支援計画管理アプリ。
// 元の単体HTMLの UI/ロジックをそのまま使い、データ保存だけをサーバー(/api/data)に切り替えている。
// 画面のマークアップは ISP_MARKUP（自動生成）、挙動は /public/isp-app.js が担当する。
export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: ISP_MARKUP }} />
      <Script src="/isp-app.js" strategy="afterInteractive" />
    </>
  );
}
