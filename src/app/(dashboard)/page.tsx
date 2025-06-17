'use client';

import React from 'react';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { FeedbackItemProps } from '@/components/feedback/feedback-item';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAnalysis } from '@/context/AnalysisContext';
import { Skeleton } from '@/components/ui/skeleton';

const WelcomeScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
    <h2 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard!</h2>
    <p className="mb-6 text-muted-foreground">It looks like you haven't analyzed any feedback yet.</p>
    <Link href="/onboarding">
      <Button>Upload a CSV to Get Started</Button>
    </Link>
  </div>
);

const LoadingSkeleton = () => (
  <div className="container mx-auto py-8">
    <div className="flex justify-between items-center mb-8">
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);

export default function DashboardPage() {
  const { analysisData, isLoading } = useAnalysis();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!analysisData || !analysisData.aiAnalysis) {
    return <WelcomeScreen />;
  }

  // Transform the analysis data to fit the FeedbackItemProps structure
  const feedbackItems: FeedbackItemProps[] = analysisData.aiAnalysis.map((item, index) => ({
    id: `${index + 1}`,
    source: "CSV Upload", // Or use another column from your CSV if available
    content: item.feedback,
    timestamp: new Date().toISOString(), // Placeholder timestamp
    sentiment: item.sentiment,
    tags: item.themes,
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Feedback from your CSV</h1>
        {/* Placeholder for global filters or actions */}
        <p className="text-muted-foreground">{analysisData.analyzedRows} / {analysisData.totalRows} rows analyzed</p>
      </div>
      <FeedbackList feedbackItems={feedbackItems} />
    </div>
  );
} 