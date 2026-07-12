import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI社員の会社",
  description: "AI社員とチャットしながら会社を運営するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="shrink-0 border-b border-black/10 dark:border-white/10 px-4 py-2 flex gap-4 text-sm">
          <Link href="/" className="hover:underline">
            🏢 AI社員チャット
          </Link>
          <Link href="/drafts" className="hover:underline">
            📝 下書き管理
          </Link>
        </nav>
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
