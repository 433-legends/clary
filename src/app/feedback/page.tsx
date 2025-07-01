'use client';

import React from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { FeedbackDataTable, feedbackSchema } from '@/components/feedback/feedback-data-table';
import { z } from 'zod';

const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
);

export default function FeedbackPage() {
  const { analysisData, isLoading } = useAnalysis();

  if (isLoading) {
    return (
        <PageContentLayout>
            <LoadingSkeleton />
        </PageContentLayout>
    )
  }

  if (!analysisData || !analysisData.aiAnalysis) {
    return (
        <PageContentLayout>
            <div className="text-center py-20">
                <p>No feedback data available. Please analyze a CSV first.</p>
            </div>
        </PageContentLayout>
    )
  }

  const feedbackItems = analysisData.aiAnalysis.map((item, index) => ({
    id: `${index + 1}`,
    content: item.feedback,
    sentiment: item.sentiment,
    tags: item.themes,
    source: "CSV Upload",
    date: new Date().toLocaleDateString('en-US'),
  }));
  
  const parsedData = z.array(feedbackSchema).parse(feedbackItems);

  return (
    <PageContentLayout>
        <FeedbackDataTable data={parsedData} />
    </PageContentLayout>
  );
}
