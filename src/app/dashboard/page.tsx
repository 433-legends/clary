'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BarChartBig, UploadCloud } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// New Dashboard Components
import { SectionCards } from "@/components/dashboard/section-cards";
import { ChartAreaInteractive, ChartItem } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useAnalysis } from '@/context/AnalysisContext';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

// The FeedbackItem now needs to be more flexible, as it comes from two different sources
interface FeedbackItem {
  text: string;
  sentiment: string;
  ai_themes: string[];
  source: string;
  date_time: string;
  // These fields might not exist in the new analysis data
  is_problem?: boolean;
  is_suggestion?: boolean;
  user_id?: string;
  location?: string;
  confidence_score?: number;
}

// Data processing functions (consolidated from previous src/app/page.tsx)
function getOverallSentimentScore(feedback: FeedbackItem[]): { score: number; positivePercentage: number; negativePercentage: number; neutralPercentage: number; } {
  if (feedback.length === 0) return { score: 0, positivePercentage: 0, negativePercentage: 0, neutralPercentage: 0 };
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  feedback.forEach(item => {
    const sentiment = item.sentiment.toLowerCase();
    if (sentiment === 'positive') positiveCount++;
    else if (sentiment === 'negative') negativeCount++;
    else neutralCount++;
  });
  const total = feedback.length;
  const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
  const negativePercentage = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
  const neutralPercentage = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
  // A simple score from -10 to 10
  const score = total > 0 ? Math.round(((positiveCount - negativeCount) / total) * 10) : 0;
  return { score, positivePercentage, negativePercentage, neutralPercentage };
}

function getProblemSuggestionCounts(feedback: FeedbackItem[]): { problems: number; suggestions: number } {
  let problems = 0;
  let suggestions = 0;
  feedback.forEach(item => {
    if (item.is_problem) problems++;
    if (item.is_suggestion) suggestions++;
  });
  return { problems, suggestions };
}

function getFeedbackVolumeTrend(feedback: FeedbackItem[], granularity: 'month' | 'week' = 'month'): ChartItem[] {
  const freq: Record<string, number> = {};
  feedback.forEach(item => {
    // Gracefully handle potentially invalid date strings
    const date = new Date(item.date_time ? item.date_time.trim() : Date.now());
    if (isNaN(date.getTime())) return; // Skip if date is invalid

    let dateKey = "";
    if (granularity === 'month') {
      dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } else { // week
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      dateKey = `${weekStart.getFullYear()}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}-${weekStart.getDate().toString().padStart(2, '0')}`;
    }
    freq[dateKey] = (freq[dateKey] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label, value }));
}

const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="p-8 border border-dashed rounded-lg">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-6 text-xl font-semibold">Welcome to Your Dashboard</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                No feedback data found. Upload a CSV through the onboarding flow to get started.
            </p>
            <Button asChild className="mt-6">
                <Link href="/onboarding">Analyze Feedback</Link>
            </Button>
        </div>
    </div>
);

const LoadingSkeleton = () => (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-80 w-full mt-4" />
        <Skeleton className="h-96 w-full mt-6" />
    </div>
);

const AnalysisInProgressScreen = () => (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 animate-pulse">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-muted-foreground">Dashboard</h1>
            <Button disabled>
              <BarChartBig className="mr-2 h-4 w-4" /> Generate Report
            </Button>
        </div>
        <div className="text-center py-4 border border-dashed rounded-lg">
            <p className="text-lg font-semibold">Analyzing feedback...</p>
            <p className="text-sm text-muted-foreground">You can come back later, this page will update automatically when it's done.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-80 w-full mt-4" />
        <Skeleton className="h-96 w-full mt-6" />
    </div>
);

export default function DashboardPage() {
  const { analysisData, isLoading: isAnalysisLoading } = useAnalysis();
  const [dashboardData, setDashboardData] = useState<FeedbackItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  const [sectionCardsData, setSectionCardsData] = useState<{
    overallSentiment: { score: number; positivePercentage: number; negativePercentage: number; neutralPercentage: number; };
    problems: number;
    suggestions: number;
    totalFeedback: number;
  } | {}>({});
  const [feedbackVolumeChartData, setFeedbackVolumeChartData] = useState<ChartItem[]>([]);

  useEffect(() => {
    if (!isAnalysisLoading) {
      if (analysisData && analysisData.aiAnalysis.length > 0) {
        // Data from context exists, transform it for the dashboard
        const transformedData = analysisData.aiAnalysis.map(item => ({
          text: item.feedback,
          sentiment: item.sentiment,
          ai_themes: item.themes,
          is_problem: item.is_problem || false,
          is_suggestion: item.is_suggestion || false,
          source: 'CSV Upload', // Mark the source
          date_time: new Date().toISOString(), // Use current date as placeholder
        }));
        setDashboardData(transformedData);
      } else {
        // No data in context, clear any existing data
        setDashboardData([]);
      }
      setIsProcessing(false);
    }
  }, [analysisData, isAnalysisLoading]);

  useEffect(() => {
    if (!isProcessing) {
      if (dashboardData.length > 0) {
        const overallSentiment = getOverallSentimentScore(dashboardData);
        const counts = getProblemSuggestionCounts(dashboardData);
        const volumeTrend = getFeedbackVolumeTrend(dashboardData, 'month');
        
        setSectionCardsData({
          overallSentiment: overallSentiment,
          problems: counts.problems,
          suggestions: counts.suggestions,
          totalFeedback: dashboardData.length,
        });
        setFeedbackVolumeChartData(volumeTrend);
      } else {
        setSectionCardsData({});
        setFeedbackVolumeChartData([]);
      }
    }
  }, [dashboardData, isProcessing]);

  const columns = useMemo<ColumnDef<FeedbackItem>[]>(() => [
    {
      accessorKey: "text",
      header: "Feedback Text",
      cell: ({ row }) => <div className="min-w-[300px] whitespace-pre-wrap">{row.getValue("text")}</div>,
    },
    {
      accessorKey: "sentiment",
      header: "Sentiment",
       cell: ({ row }) => {
        const sentiment = (row.getValue("sentiment") as string || '').toLowerCase();
        let colorClass = "text-muted-foreground";
        if (sentiment === "positive") colorClass = "text-green-500";
        else if (sentiment === "negative") colorClass = "text-red-500";
        return <span className={`capitalize ${colorClass}`}>{sentiment}</span>;
      },
    },
    {
      accessorKey: "ai_themes",
      header: "AI Themes",
      cell: ({ row }) => {
        const themes = row.getValue("ai_themes") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {themes && themes.map((theme, index) => (
              <span key={index} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                {theme}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "date_time",
      header: "Date",
      cell: ({ row }) => {
        const dateStr = row.getValue("date_time");
        const date = dateStr ? new Date(dateStr as string) : new Date();
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
  ], []);

  if (isAnalysisLoading) {
    return <AnalysisInProgressScreen />;
  }

  if (dashboardData.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Page Title and Actions */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Button>
          <BarChartBig className="mr-2 h-4 w-4" /> Generate Report
        </Button>
      </div>

      <SectionCards data={sectionCardsData} />
      
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={feedbackVolumeChartData} title="Feedback Volume Trend" />
      </div>
      
      <DataTable columns={columns} data={dashboardData} title="Analyzed Feedback Entries"/>
    </div>
  );
}
