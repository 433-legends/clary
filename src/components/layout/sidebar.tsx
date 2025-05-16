import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Shapes, Link2, ChevronDown, Zap } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-muted/40 border-r fixed inset-y-0">
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          {/* <img src="/logo.svg" alt="Clarities Logo" className="h-6 w-6" /> Placeholder for logo */}
          <span>Clarities</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Button variant="ghost" className="w-full justify-start text-base" asChild>
          <Link href="/">
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base" asChild>
          <Link href="/insights">
            <Zap className="mr-3 h-5 w-5" />
            Insights
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base" asChild>
          <Link href="#">
            {/* Using Shapes icon as a placeholder for Themes */}
            <Shapes className="mr-3 h-5 w-5" />
            Themes
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-base" asChild>
          <Link href="/integrations">
            <Link2 className="mr-3 h-5 w-5" />
            Integrations
          </Link>
        </Button>
      </nav>
      {/* Future placeholder for user profile or settings at the bottom */}
      {/* <div className="mt-auto p-4 border-t">
        <p className="text-sm text-muted-foreground">User Settings</p>
      </div> */}
    </aside>
  );
} 