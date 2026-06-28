import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "心镜 MindMirror",
  description: "把脑袋里的小人具像化 —— 不给你答案，给你看一场内心对话",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
