"use client";

import React, { useMemo } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { ThemeCard } from '@/components/insights/theme-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Theme } from '@/context/AnalysisContext';
import { FeedbackDataTable, columns } from '@/components/feedback/data-table';
import { FeedbackItemProps } from '@/components/feedback/feedback-item';
import { ColumnDef } from '@tanstack/react-table';

const LoadingSpinner = () => (
    <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
);

const WelcomeScreen = () => (
    <PageContentLayout>
        <EmptyState
            title="Discover Themes in Your Feedback"
            description="Upload a CSV to start clustering your feedback into actionable themes."
            actionLabel="Get Started"
            actionHref="/onboarding"
        />
    </PageContentLayout>
);

export default function InsightsPage() {
    const { analysisData, isThemeLoading } = useAnalysis();
    const [selectedTheme, setSelectedTheme] = React.useState<Theme | null>(null);

    const themes = useMemo(() => {
        return analysisData?.themes ?? [];
    }, [analysisData?.themes]);

    const selectedThemeFeedback = useMemo(() => {
        if (!selectedTheme || !analysisData?.sentiments) {
            return [];
        }

        const sentimentMap = new Map(analysisData.sentiments.map(s => [s.Input, s]));
        
        return selectedTheme.FeedbackTexts.map((feedbackText, index) => {
            const sentiment = sentimentMap.get(feedbackText);
            return {
                id: `${selectedTheme.Label}-${index}`,
                content: feedbackText,
                tags: [sentiment?.Category || 'UNCATEGORIZED'],
                sentiment: (sentiment ? (sentiment.Sentiment > 6 ? 'positive' : sentiment.Sentiment < 5 ? 'negative' : 'neutral') : 'neutral') as 'positive' | 'negative' | 'neutral',
                source: 'CSV Upload', // Assuming source
                timestamp: new Date().toISOString(), // Assuming timestamp
            };
        });

    }, [selectedTheme, analysisData?.sentiments]);


    if (isThemeLoading) {
        return <LoadingSpinner />;
    }

    if (!analysisData || !themes || themes.length === 0) {
        return <WelcomeScreen />;
    }
    
    return (
        <PageContentLayout>
            <div className="flex flex-col gap-4">
                {themes.map((theme, index) => (
                    <ThemeCard 
                        key={index} 
                        theme={theme}
                        onViewClick={() => setSelectedTheme(theme)}
                    />
                ))}
            </div>

            <Sheet open={!!selectedTheme} onOpenChange={(isOpen) => !isOpen && setSelectedTheme(null)}>
                <SheetContent className="w-full sm:max-w-2xl p-0">
                    <SheetHeader className="p-6">
                        <SheetTitle>{selectedTheme?.Label}</SheetTitle>
                    </SheetHeader>
                    <div className="px-1 py-4">
                        <FeedbackDataTable 
                            columns={columns} 
                            data={selectedThemeFeedback} 
                            hideAllTab={true}
                            initialVisibility={{
                                tags: false, // Hide category column
                                source: false, // Hide source column
                            }}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </PageContentLayout>
    );
} 
