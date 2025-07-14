"use client"; // Or remove if no client-side hooks/interactions are needed here directly

import React from 'react';

interface PageContentLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageContentLayout({
  children,
  actions
}: PageContentLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-2 md:p-6">
      {actions && (
        <div className="flex items-center justify-end">
          {actions}
      </div>
      )}
      {children}
    </div>
  );
} 