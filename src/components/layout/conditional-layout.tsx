"use client";

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { GlobalHeader } from '@/components/layout/global-header';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { ChatbotPanel } from '@/components/chatbot/chatbot-panel';
import { SidebarProvider } from '@/components/ui/sidebar';

const noSidebarRoutes = ['/login', '/onboarding', '/'];

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showSidebar = !noSidebarRoutes.includes(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <GlobalHeader />
          <PageContentLayout>{children}</PageContentLayout>
        </main>
        <ChatbotPanel />
      </div>
    </SidebarProvider>
  );
} 