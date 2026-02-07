'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAnalysis } from '@/context/AnalysisContext';
import { SectionCards } from '@/components/dashboard/section-cards';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { AnalysisInProgressScreen } from '../../../components/dashboard/analysis-in-progress';

const WelcomeScreen = () => (
    <PageContentLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 py-20 text-center">
            <img src="/empty-state.svg" alt="" className="mb-6 w-48 h-auto" aria-hidden="true" />
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h2>
            <p className="mb-6 text-muted-foreground">It looks like you haven't analyzed any feedback yet.</p>
            <Link href="/onboarding">
                <Button>Upload a CSV to Get Started</Button>
            </Link>
        </div>
    </PageContentLayout>
);

export default function DashboardPage() {
  const { analysisData, isLoading } = useAnalysis();

  if (isLoading) {
    return <AnalysisInProgressScreen />;
  }

  if (!analysisData || !analysisData.aiAnalysis || analysisData.aiAnalysis.length === 0) {
    return <WelcomeScreen />;
  }

  // Manually calculate the stats from the analysis data
  const totalItems = analysisData.aiAnalysis.length;
  const sentimentScores = { positive: 1, neutral: 0, negative: -1 };
  
  let totalScore = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  let problemsCount = 0;
  let suggestionsCount = 0;

  analysisData.aiAnalysis.forEach(item => {
    totalScore += sentimentScores[item.sentiment] || 0;
    if (item.sentiment === 'positive') positiveCount++;
    if (item.sentiment === 'negative') negativeCount++;
    if (item.sentiment === 'neutral') neutralCount++;
    if (item.is_problem) problemsCount++;
    if (item.is_suggestion) suggestionsCount++;
  });

  const cardData = {
      overallSentiment: {
          score: totalItems > 0 ? totalScore / totalItems : 0,
          positivePercentage: totalItems > 0 ? (positiveCount / totalItems) * 100 : 0,
          negativePercentage: totalItems > 0 ? (negativeCount / totalItems) * 100 : 0,
          neutralPercentage: totalItems > 0 ? (neutralCount / totalItems) * 100 : 0,
      },
      problems: problemsCount,
      suggestions: suggestionsCount,
      totalFeedback: analysisData.analyzedRows
  }

  return (
    <PageContentLayout title="Dashboard">
        <SectionCards data={cardData} />
    </PageContentLayout>
  );
} 
