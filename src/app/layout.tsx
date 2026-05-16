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
  title: "Notia OS - 프리미엄 학원 운영 자동화 솔루션",
  description: "선생님의 정성은 그대로, 행정은 지능형으로. 대한민국 No.1 학원 운영 시스템 Notia OS.",
  openGraph: {
    title: "Notia OS - 프리미엄 학원 운영 자동화 솔루션",
    description: "선생님의 정성은 그대로, 행정은 지능형으로. 대한민국 No.1 학원 운영 시스템 Notia OS.",
    url: "https://notia.vercel.app", // Adjust if domain is different
    siteName: "Notia OS",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notia OS - 프리미엄 학원 운영 자동화 솔루션",
    description: "선생님의 정성은 그대로, 행정은 지능형으로. 대한민국 No.1 학원 운영 시스템 Notia OS.",
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
