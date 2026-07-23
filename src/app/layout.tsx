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

export const metadata: Metadata = {
  title: "旅行ルート・周辺スポット検索",
  description:
    "出発地と目的地からルート・所要時間・概算料金・サービスエリア・道の駅・観光スポットを検索するWebアプリ",
  openGraph: {
    title: "旅行ルート・周辺スポット検索",
    description:
      "交通手段別ルートとルート沿いのおすすめスポットを地図上で確認できるポートフォリオアプリ",
    locale: "ja_JP",
    type: "website",
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
