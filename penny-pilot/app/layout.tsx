import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const carlos = "hello";

import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Penny Pilot",
  description: "Smart budgeting and expense tracking app",
  icons: {
    icon: "/images/coin.ico",
    apple: "/images/coin.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overflowY: "auto" }}>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader />
          <div className="flex flex-1 pt-[60px]">
            <Sidebar />
            <div className="flex-1 md:ml-64">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
