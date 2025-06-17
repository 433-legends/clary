"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search, SparklesIcon as MagicIcon, Moon, Sun, Laptop } from 'lucide-react';
import { useChatbot } from "@/components/chatbot/chatbot-provider";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export function GlobalHeader() {
  const router = useRouter();
  const { toggle: toggleChatbot } = useChatbot();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prevOpen) => !prevOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-2 sm:h-16 sm:px-4">
        {/* Left: Sidebar Trigger */}
        <div>
          <SidebarTrigger />
        </div>

        {/* Center: Search Box / Command Palette Trigger */}
        <div className="flex-grow flex justify-center">
          <Button
            variant="outline"
            className="flex h-9 w-full max-w-xs items-center justify-between rounded-md border px-3 py-1 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:max-w-sm md:max-w-md"
            onClick={() => setOpen(true)}
          >
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              <span>Search feedback, themes...</span>
            </div>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right: Chatbot Trigger */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleChatbot} aria-label="Toggle AI Assistant">
            <MagicIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/insights'))}>
              <span>Insights</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/themes'))}>
              <span>Themes</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/integrations'))}>
              <span>Integrations</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(toggleChatbot)}>
              <MagicIcon className="mr-2 h-4 w-4" />
              <span>Toggle AI Assistant</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop className="mr-2 h-4 w-4" />
              System
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
} 