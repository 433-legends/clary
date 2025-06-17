import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import React from 'react';
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { ChatbotProvider } from "@/components/chatbot/chatbot-provider";
import { AnalysisProvider } from "@/context/AnalysisContext";

const inter = Inter({ subsets: ["latin"] });
const cacheBuster = new Date().getTime();

export const metadata: Metadata = {
  title: "Clarities",
  description: "Get insights from your customer feedback.",
  icons: {
    icon: `/icon.svg?v=${cacheBuster}`,
    apple: `/apple-icon.svg?v=${cacheBuster}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ChatbotProvider>
            <AnalysisProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </AnalysisProvider>
          </ChatbotProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
