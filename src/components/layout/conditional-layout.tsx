"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GlobalHeader } from "@/components/layout/global-header";
import { ChatbotProvider } from "@/components/chatbot/chatbot-provider";
import { ChatbotPanel } from "@/components/chatbot/chatbot-panel";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  if (isLoginPage) {
    return <>{children}</>; // Render only children for the login page
  }

  return (
    <SidebarProvider>
      <ChatbotProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <SidebarInset>
            <GlobalHeader />
            {children}
          </SidebarInset>
          <ChatbotPanel />
        </div>
      </ChatbotProvider>
    </SidebarProvider>
  );
} 