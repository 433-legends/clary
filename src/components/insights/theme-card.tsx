'use client';

import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Theme } from '@/context/AnalysisContext';
import { Button } from '../ui/button';

interface ThemeCardProps {
  theme: Theme;
  onViewClick: () => void;
}

export function ThemeCard({ theme, onViewClick }: ThemeCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <div>
            <CardTitle className="text-lg leading-tight">{theme.Label}</CardTitle>
            <p className="text-sm text-muted-foreground">{theme.FeedbackTexts.length} feedback items</p>
        </div>
        <Button onClick={onViewClick} variant="outline">View</Button>
      </div>
    </Card>
  );
} 