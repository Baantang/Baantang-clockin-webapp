import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "ระบบลงเวลาทำงาน",
  description: "ระบบลงเวลาทำงานพนักงาน และสรุปข้อความจาก LINE",
  appleWebApp: {
    title: "BT ลงเวลา",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#d98a3d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-app text-ink">{children}</body>
    </html>
  );
}
