"use client"; // Or remove if no client-side hooks/interactions are needed here directly

import React from 'react';
import { cn } from '@/lib/utils';

interface PageContentLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageContentLayout({
  children,
  actions,
  className
}: PageContentLayoutProps) {
  return (
    <div className={cn("flex-1 space-y-4 p-2 md:p-6", className)}>
      {actions && (
        <div className="flex items-center justify-end">
          {actions}
      </div>
      )}
      {children}
    </div>
  );
} 