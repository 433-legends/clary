"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SparklesIcon as MagicIcon } from 'lucide-react';
import { useChatbot } from "@/components/chatbot/chatbot-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// A utility to capitalize the first letter of a string
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean); // Filter out empty strings

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{capitalize(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function GlobalHeader() {
  const { toggle: toggleChatbot } = useChatbot();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-2 sm:h-16 sm:px-4">
      {/* Left: Sidebar Trigger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <DynamicBreadcrumb />
      </div>

      {/* Right: Chatbot Trigger */}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleChatbot} aria-label="Toggle AI Assistant">
          <MagicIcon className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
} 