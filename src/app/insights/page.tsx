"use client";

import React from 'react';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useAnalysis } from '@/context/AnalysisContext';
import { Loader2 } from 'lucide-react';

export default function InsightsPage() {
  const { analysisData, isLoading } = useAnalysis();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Analyzing feedback and generating insights...</p>
        </div>
      );
    }

    if (!analysisData || !analysisData.themes || analysisData.themes.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Insights Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            To generate insights, please upload a CSV file with customer feedback. The system will automatically cluster feedback into themes.
          </p>
          <Button asChild>
            <Link href="/onboarding">Analyze Feedback File</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {analysisData.themes.map((theme, index) => (
          <Card key={index}>
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
        ))}
      </div>
    );
  };

  return (
    <PageContentLayout>
      {renderContent()}
    </PageContentLayout>
  );
} 