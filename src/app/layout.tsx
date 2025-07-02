import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { ChatbotProvider } from "@/components/chatbot/chatbot-provider";
import { AnalysisProvider } from "@/context/AnalysisContext";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Clary",
  description: "Get insights from your customer feedback.",
  icons: {
    icon: "/icon.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AnalysisProvider>
            <ChatbotProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <Toaster />
            </ChatbotProvider>
          </AnalysisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}