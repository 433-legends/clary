"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GlobalHeader } from "@/components/layout/global-header";
import { ChatbotPanel } from "@/components/chatbot/chatbot-panel";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  const isOnboardingPage = pathname === '/onboarding'; // Check for onboarding path

  if (isLoginPage || isOnboardingPage) { // If login OR onboarding, render children directly
    return <>{children}</>; 
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <GlobalHeader />
          {children}
        </SidebarInset>
        <ChatbotPanel />
      </div>
    </SidebarProvider>
  );
} 