import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { latestEventTimestamp } from "@/app/events/action";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const asOf = await latestEventTimestamp();

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar asOf={asOf} />
            <main className="min-w-0 flex-1 px-5 pb-12 md:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
