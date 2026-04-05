import type { Metadata } from "next";
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

// 💡 変更ポイント1：SEO設定をLocalWiki専用のものに書き換え
export const metadata: Metadata = {
  title: {
    template: '%s | Genquiry',
    default: 'Genquiry - 質問箱形式で育つ新たな知識プラットフォーム',
  },
  description: "AIの原案をみんなの知恵で進化(GEN)させる、質問箱形式の新しい知識共有サービスです。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "Genquiry",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 💡 変更ポイント2：英語（en）から日本語（ja）に変更
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}