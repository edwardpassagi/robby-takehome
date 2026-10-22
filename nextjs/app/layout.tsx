import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Phoenix Services",
    template: "%s · Phoenix Services",
  },
  description: "Follow-up dashboard for open home-service quotes.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="flex min-h-screen">
          <Suspense fallback={<div className="hidden w-[232px] shrink-0 border-r border-gray-200 bg-white md:block" />}>
            <Sidebar />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="min-w-0 flex-1 px-5 pb-12 md:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
