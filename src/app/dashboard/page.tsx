'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { BarChartBig } from 'lucide-react'; // Only BarChartBig is used in the final return
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

interface FeedbackItem {
  text: string;
  sentiment: string;
  ai_themes: string[];
  is_problem: boolean;
  is_suggestion: boolean;
  source: string;
  date_time: string;
  user_id: string;
  location: string;
  confidence_score: number;
}

// Data processing functions (consolidated from previous src/app/page.tsx)
function getOverallSentimentScore(feedback: FeedbackItem[]): { score: number; positivePercentage: number; negativePercentage: number; neutralPercentage: number; } {
  if (feedback.length === 0) return { score: 0, positivePercentage: 0, negativePercentage: 0, neutralPercentage: 0 };
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  feedback.forEach(item => {
    if (item.sentiment === 'positive') positiveCount++;
    else if (item.sentiment === 'negative') negativeCount++;
    else neutralCount++;
  });
  const total = feedback.length;
  const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
  const negativePercentage = total > 0 ? Math.round((negativeCount / total) * 100) : 0;
  const neutralPercentage = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
  const score = Math.round(((positivePercentage - negativePercentage) / 100) * 10);
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
    const date = new Date(item.date_time.trim());
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


export default function DashboardPage() {
  const [allFeedbackData, setAllFeedbackData] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sectionCardsData, setSectionCardsData] = useState<{
    overallSentiment: { score: number; positivePercentage: number; negativePercentage: number; neutralPercentage: number; };
    problems: number;
    suggestions: number;
    totalFeedback: number;
  } | {}>({});
  const [feedbackVolumeChartData, setFeedbackVolumeChartData] = useState<ChartItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/processed_feedback.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: FeedbackItem[] = await response.json();
        setAllFeedbackData(data);

        const overallSentiment = getOverallSentimentScore(data);
        const counts = getProblemSuggestionCounts(data);
        const volumeTrend = getFeedbackVolumeTrend(data, 'month');
        
        setSectionCardsData({
          overallSentiment: overallSentiment,
          problems: counts.problems,
          suggestions: counts.suggestions,
          totalFeedback: data.length,
        });
        setFeedbackVolumeChartData(volumeTrend);
        // console.log("Restored Dashboard - Processed Feedback Volume Trend Data:", volumeTrend);

      } catch (error) {
        console.error("Failed to fetch or process feedback data for dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
        const sentiment = row.getValue("sentiment") as string;
        let colorClass = "text-muted-foreground";
        if (sentiment === "positive") colorClass = "text-green-500";
        else if (sentiment === "negative") colorClass = "text-red-500";
        return <span className={colorClass}>{sentiment}</span>;
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
        const date = new Date(row.getValue("date_time"));
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
  ], []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-theme(space.16))]">Loading dashboard data...</div>;
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
      
      <DataTable columns={columns} data={allFeedbackData} title="All Feedback Entries"/>
        </div>
  );
}
