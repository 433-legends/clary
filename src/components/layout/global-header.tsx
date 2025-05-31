"use client";

import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SparklesIcon as MagicIcon } from 'lucide-react'; // Renamed SparklesIcon to MagicIcon
import { useChatbot } from "@/components/chatbot/chatbot-provider";

export function GlobalHeader() {
  const { toggle: toggleChatbot } = useChatbot();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 bg-background px-2 sm:h-16 sm:px-4">
      {/* Left: Sidebar Trigger */}
      <div>
        <SidebarTrigger /> {/* Removed md:hidden, size-7 is 1.75rem (28px) by default from Button */}
      </div>

      {/* Center: Search Box */}
      <div className="flex-grow flex justify-center">
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search feedback, themes..."
            className="w-full pl-10 pr-4" // Added pr-4 for right padding
          />
        </div>
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