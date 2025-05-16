import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { GlobalHeader } from '@/components/layout/header';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Insights.app",
  description: "Aggregate feedback and gain insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen w-full bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 md:ml-64">
              <GlobalHeader />
              <main className="flex-1 p-4 py-6 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
