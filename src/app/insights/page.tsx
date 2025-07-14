"use client";

import React, { useMemo } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThemeCard } from '@/components/insights/theme-card';

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);

const WelcomeScreen = () => (
    <PageContentLayout>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/20 py-20 text-center">
            <h2 className="text-2xl font-semibold mb-4">Discover Themes in Your Feedback</h2>
            <p className="mb-6 text-muted-foreground">Upload a CSV to start clustering your feedback into actionable themes.</p>
            <Link href="/onboarding">
                <Button>Get Started</Button>
            </Link>
        </div>
    </PageContentLayout>
);

export default function InsightsPage() {
    const { analysisData, isThemeLoading } = useAnalysis();

    const themes = useMemo(() => {
        return analysisData?.themes ?? [];
    }, [analysisData?.themes]);

    if (isThemeLoading) {
        return <LoadingSpinner />;
    }

    if (!analysisData || !themes || themes.length === 0) {
        return <WelcomeScreen />;
    }
    
    return (
        <PageContentLayout>
            <h1 className="text-2xl font-semibold mb-4">Feedback Themes & Insights</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {themes.map((theme, index) => (
                    <ThemeCard 
                        key={index} 
                        theme={theme} 
                    />
                ))}
            </div>
        </PageContentLayout>
    );
} 