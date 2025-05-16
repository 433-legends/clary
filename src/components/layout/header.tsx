import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-center border-b bg-background px-4 md:px-6">
      <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl"> {/* Centered search container */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-muted pl-10 py-2 text-sm"
        />
      </div>
    </header>
  );
} 