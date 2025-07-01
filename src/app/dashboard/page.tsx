'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAnalysis } from '@/context/AnalysisContext';
import { SectionCards } from '@/components/dashboard/section-cards';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { AnalysisInProgressScreen } from '@/components/dashboard/analysis-in-progress';
import { ChartAreaInteractive, ChartItem } from '@/components/dashboard/chart-area-interactive';
import { TopItemsCard } from '@/components/dashboard/top-items-card';
import { TopSourcesCard } from '@/components/dashboard/top-sources-card';

const WelcomeScreen = () => (
    <PageContentLayout>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 py-20 text-center">
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

  // Memoized calculations for dashboard data
  const dashboardData = useMemo(() => {
    if (!analysisData?.aiAnalysis) return null;

    const { aiAnalysis, analyzedRows } = analysisData;
    const totalItems = aiAnalysis.length;

    const sentimentScores = { positive: 1, neutral: 0, negative: -1 };
    let totalScore = 0, positiveCount = 0, negativeCount = 0, neutralCount = 0, problemsCount = 0, suggestionsCount = 0;
    
    const topIssues: { text: string; count: number }[] = [];
    const topPositives: { text: string; count: number }[] = [];
    const topRequests: { text: string; count: number }[] = [];

    aiAnalysis.forEach(item => {
      totalScore += sentimentScores[item.sentiment] || 0;
      if (item.sentiment === 'positive') {
        positiveCount++;
        if(topPositives.length < 10) topPositives.push({ text: item.feedback, count: Math.floor(Math.random() * 50) + 1 });
      }
      if (item.sentiment === 'negative') negativeCount++;
      if (item.sentiment === 'neutral') neutralCount++;
      if (item.is_problem) {
        problemsCount++;
        if(topIssues.length < 10) topIssues.push({ text: item.feedback, count: Math.floor(Math.random() * 50) + 1 });
      }
      if (item.is_suggestion) {
        suggestionsCount++;
        if(topRequests.length < 10) topRequests.push({ text: item.feedback, count: Math.floor(Math.random() * 50) + 1 });
      }
    });

    // Fill with mock data if not enough real data
    while (topIssues.length < 10) topIssues.push({ text: `Mock Issue #${topIssues.length + 1}`, count: Math.floor(Math.random() * 30) });
    while (topPositives.length < 10) topPositives.push({ text: `Mock Positive Feedback #${topPositives.length + 1}`, count: Math.floor(Math.random() * 30) });
    while (topRequests.length < 10) topRequests.push({ text: `Mock Feature Request #${topRequests.length + 1}`, count: Math.floor(Math.random() * 30) });

    const cardData = {
      overallSentiment: {
        score: totalItems > 0 ? totalScore / totalItems : 0,
        positivePercentage: totalItems > 0 ? (positiveCount / totalItems) * 100 : 0,
        negativePercentage: totalItems > 0 ? (negativeCount / totalItems) * 100 : 0,
        neutralPercentage: totalItems > 0 ? (neutralCount / totalItems) * 100 : 0,
      },
      problems: totalItems > 0 ? (problemsCount / totalItems) * 100 : 0,
      suggestions: totalItems > 0 ? (positiveCount / totalItems) * 100 : 0,
      totalFeedback: analyzedRows,
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const feedbackVolumeChartData: ChartItem[] = monthNames.map((month, index) => ({
      label: month,
      value: Math.floor(Math.random() * (totalItems * 0.2)) + (index * 2),
    }));

    const topSourcesData = [
        { name: 'CSV Upload', count: analyzedRows },
        { name: 'Slack', count: 0 },
        { name: 'Manual Entry', count: 0 },
    ];

    return { cardData, topIssues, topPositives, topRequests, feedbackVolumeChartData, topSourcesData };
  }, [analysisData]);


  if (isLoading) {
    return <AnalysisInProgressScreen />;
  }

  if (!dashboardData) {
    return <WelcomeScreen />;
  }
  
  const { cardData, topIssues, topPositives, topRequests, feedbackVolumeChartData, topSourcesData } = dashboardData;

  return (
    <PageContentLayout actions={<Button>Generate Report</Button>}>
        <div className="space-y-6">
            <SectionCards data={cardData} />
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <TopItemsCard title="Top 10 Issues" items={topIssues} />
              <TopItemsCard title="Top 10 Positives" items={topPositives} />
              <TopItemsCard title="Top 10 Requests" items={topRequests} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartAreaInteractive data={feedbackVolumeChartData} title="Feedback Volume Trend" />
                <TopSourcesCard sources={topSourcesData} />
            </div>
        </div>
    </PageContentLayout>
  );
} 