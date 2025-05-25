"use client"; // Or remove if no client-side hooks/interactions are needed here directly

import React from 'react';

interface PageContentLayoutProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageContentLayout({
  title,
  children,
  actions
}: PageContentLayoutProps) {
  return (
    <div className="flex-1 space-y-4 p-2 md:p-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-semibold tracking-normal">
          {title}
        </h2>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  );
} 