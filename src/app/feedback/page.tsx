'use client';

import React from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FeedbackItemProps } from '@/components/feedback/feedback-item';
import { FeedbackDataTable, columns } from '@/components/feedback/data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';

const LoadingSkeleton = () => (
    <PageContentLayout>
        <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
        </div>
    </PageContentLayout>
);

const WelcomeScreen = () => (
    <PageContentLayout>
        <EmptyState
            title="No Feedback to Display"
            description="Upload a CSV file to see your feedback list here."
            actionLabel="Get Started"
            actionHref="/onboarding"
        />
    </PageContentLayout>
);

export default function FeedbackPage() {
    const { analysisData, isLoading } = useAnalysis();

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!analysisData || !analysisData.sentiments || analysisData.sentiments.length === 0) {
        return <WelcomeScreen />;
    }

    const feedbackItems = analysisData.sentiments.map((item, index) => ({
        id: `${index}`,
        content: item.Input, 
        tags: [item.Category],
        sentiment: (item.Sentiment > 6 ? 'positive' : item.Sentiment < 5 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
        source: 'CSV Upload', 
        timestamp: new Date().toISOString(),
    }));

    return (
        <PageContentLayout className="p-0">
            <FeedbackDataTable columns={columns} data={feedbackItems} />
        </PageContentLayout>
    );
}
