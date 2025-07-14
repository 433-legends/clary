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
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 py-20 text-center">
            <h2 className="text-2xl font-semibold mb-4">No Feedback to Display</h2>
            <p className="mb-6 text-muted-foreground">Upload a CSV file to see your feedback list here.</p>
            <Link href="/onboarding">
                <Button>Get Started</Button>
            </Link>
        </div>
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
        <PageContentLayout>
            <FeedbackDataTable columns={columns} data={feedbackItems} />
        </PageContentLayout>
    );
}
