'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Theme } from '@/context/AnalysisContext';

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg leading-tight">{theme.Label}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {theme.FeedbackTexts.slice(0, 5).map((feedback, fIndex) => (
            <li key={fIndex} className="text-sm text-muted-foreground border-l-2 pl-4">
              {feedback}
            </li>
          ))}
          {theme.FeedbackTexts.length > 5 && (
              <li className="text-xs font-medium text-muted-foreground pt-2 pl-4">
                  + {theme.FeedbackTexts.length - 5} more feedback items
              </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
} 