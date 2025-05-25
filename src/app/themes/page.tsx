"use client";

import React from 'react';
import { PageContentLayout } from '@/components/layout/page-content-layout';

export default function ThemesPage() {
  return (
    <PageContentLayout title="Themes">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Explore and manage feedback themes here.
        </p>
        <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            Themes content will go here.
          </p>
        </div>
        {/* Placeholder for theme listing, filtering, and visualization */}
      </div>
    </PageContentLayout>
  );
} 