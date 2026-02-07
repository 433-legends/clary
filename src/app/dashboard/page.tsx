'use client';

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAnalysis } from '@/context/AnalysisContext';
import { SectionCards } from '@/components/dashboard/section-cards';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { ChartAreaInteractive, ChartItem } from '@/components/dashboard/chart-area-interactive';
import { TopItemsCard } from '@/components/dashboard/top-items-card';
import { TopSourcesCard } from '@/components/dashboard/top-sources-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';


const WelcomeScreen = () => (
    <PageContentLayout>
        <EmptyState
            title="Welcome to Your Dashboard"
            description="It looks like you haven't analyzed any feedback yet. Upload a CSV file to get started."
            actionLabel="Upload a CSV to Get Started"
            actionHref="/onboarding"
        />
    </PageContentLayout>
);

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);


export default function DashboardPage() {
  const { analysisData, isLoading } = useAnalysis();

  const dashboardData = useMemo(() => {
    if (!analysisData?.sentiments) return null;

    const { sentiments } = analysisData;
    const totalItems = sentiments.length;

    let positiveCount = 0, negativeCount = 0, neutralCount = 0;
    const categoryCounts: Record<string, number> = {};

    sentiments.forEach(item => {
      if (item.Sentiment >= 7) positiveCount++;
      else if (item.Sentiment <= 4) negativeCount++;
      else neutralCount++;
      
      const category = item.Category || 'UNCATEGORIZED';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const getTopItems = (categoryName: 'PROBLEMS' | 'REQUESTS' | 'PRAISE', count: number) => {
      return sentiments
        .filter(item => item.Category === categoryName)
        .slice(0, count)
        .map(item => ({
          text: item.Input, // Use the actual feedback text
          count: 1, // Each feedback is a unique item, so count is 1
        }));
    };

    const topIssues = getTopItems('PROBLEMS', 10);
    const topRequests = getTopItems('REQUESTS', 10);
    const topPraise = getTopItems('PRAISE', 10);


    const cardData = {
      overallSentiment: {
        score: -0.4, // Simplified
        positivePercentage: totalItems > 0 ? (positiveCount / totalItems) * 100 : 0,
        negativePercentage: totalItems > 0 ? (negativeCount / totalItems) * 100 : 0,
        neutralPercentage: totalItems > 0 ? (neutralCount / totalItems) * 100 : 0,
      },
      problems: categoryCounts['PROBLEMS'] || 0,
      suggestions: categoryCounts['REQUESTS'] || 0,
      positives: categoryCounts['PRAISE'] || 0,
      totalFeedback: totalItems,
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const feedbackVolumeChartData: ChartItem[] = monthNames.map((month, index) => ({
      label: month,
      value: Math.floor(Math.random() * (totalItems * 0.2)) + (index * 2), // Still random
    }));

    const topSourcesData = [
        { name: 'CSV Upload', count: totalItems },
        { name: 'Slack', count: 0 },
        { name: 'Manual Entry', count: 0 },
    ];

    return { cardData, topIssues, topPositives: topPraise, topRequests, feedbackVolumeChartData, topSourcesData };
  }, [analysisData]);


  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!analysisData || !dashboardData) {
    return <WelcomeScreen />;
  }
  
  const { cardData, topIssues, topPositives, topRequests, feedbackVolumeChartData, topSourcesData } = dashboardData;

  return (
    <PageContentLayout actions={<Button>Generate Report</Button>}>
        <div className="space-y-6">
            <SectionCards data={cardData} />
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TopItemsCard title="Top 10 Issues" items={topIssues} />
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
