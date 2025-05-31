'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { History, TrendingUp, AlertTriangle, Lightbulb, MessageSquare, ListChecks, Users, BarChartBig, Droplets, PanelLeftOpen, Search } from 'lucide-react';
import { InfoCard, BarChartItem } from '@/components/dashboard/info-card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { ColumnDef } from "@tanstack/react-table";

// New Dashboard Components
import { SectionCards } from "@/components/dashboard/section-cards";
import { ChartAreaInteractive, ChartItem } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";

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

interface ThemeVolume {
  theme: string;
  volume: number;
}

interface DatedThemeVolume extends ThemeVolume {
  date: string; // e.g., "YYYY-MM"
}

interface MultiLineChartData {
  date: string; // X-axis label (e.g., month)
  [themeName: string]: number | string; // Y-axis values for each theme, plus the date
}

function getTopThemes(feedback: FeedbackItem[], topN = 10): ThemeVolume[] {
  const freq: Record<string, number> = {};
  feedback.forEach(item => {
    if (item.ai_themes && Array.isArray(item.ai_themes)) {
      item.ai_themes.forEach(theme => {
        if (theme && theme.toLowerCase() !== "error extracting themes") {
          freq[theme] = (freq[theme] || 0) + 1;
        }
      });
    }
  });
  const sortedThemes = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([theme, volume]) => ({ theme, volume }));
  return sortedThemes;
}

function getSentimentDistribution(feedback: FeedbackItem[]): BarChartItem[] {
  const sentiments: Record<string, number> = { Positive: 0, Negative: 0, Neutral: 0 };
  let totalSentiments = 0;
  feedback.forEach(item => {
    if (item.sentiment === 'positive') sentiments.Positive++;
    else if (item.sentiment === 'negative') sentiments.Negative++;
    else sentiments.Neutral++;
    totalSentiments++;
  });

  if (totalSentiments === 0) {
    return [
      { label: 'Positive', value: 0 },
      { label: 'Negative', value: 0 },
      { label: 'Neutral', value: 0 },
    ];
  }

  return Object.entries(sentiments).map(([name, count]) => ({
    label: name,
    value: Math.round((count / totalSentiments) * 100), // Calculate percentage
  }));
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

function getTopSources(feedback: FeedbackItem[], topN = 5): BarChartItem[] {
  const freq: Record<string, number> = {};
  feedback.forEach(item => {
    const src = item.source ? item.source.trim() : "Unknown";
    freq[src] = (freq[src] || 0) + 1;
  });
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
  
  const totalFeedback = feedback.length;
  if (totalFeedback === 0) return sorted.map(([label, value]) => ({ label, value: 0}));

  return sorted.map(([label, value]) => ({ 
    label, 
    value: Math.round((value / totalFeedback) * 100) // As percentage of total feedback
  }));
}

function getTopNegativeFeedbackTexts(feedback: FeedbackItem[], topN = 5): string[] {
  return feedback
    .filter(item => item.sentiment === 'negative')
    .sort((a,b) => b.confidence_score - a.confidence_score) // Example: sort by confidence or recency
    .slice(0, topN)
    .map(item => item.text);
}

function getTopSuggestionTexts(feedback: FeedbackItem[], topN = 5): string[] {
  return feedback
    .filter(item => item.is_suggestion)
    // .sort((a,b) => b.date_time.localeCompare(a.date_time)) // Example: sort by recency
    .slice(0, topN)
    .map(item => item.text);
}

function getFeedbackOverTimeForTopThemes(feedback: FeedbackItem[], topNThemes = 5, granularity: 'month' | 'week' = 'month'): MultiLineChartData[] {
  const overallTopThemes = getTopThemes(feedback, topNThemes).map(t => t.theme);
  if (overallTopThemes.length === 0) return [];

  const timeMap: Record<string, Record<string, number>> = {}; // { "YYYY-MM": { "themeA": count, "themeB": count } }

  feedback.forEach(item => {
    const date = new Date(item.date_time.trim());
    let dateKey = "";
    if (granularity === 'month') {
      dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    } else { // week
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Sunday as start of week
      dateKey = `${weekStart.getFullYear()}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}-${weekStart.getDate().toString().padStart(2, '0')}`;
    }

    if (!timeMap[dateKey]) {
      timeMap[dateKey] = {};
      overallTopThemes.forEach(theme => timeMap[dateKey][theme] = 0);
    }

    item.ai_themes.forEach(theme => {
      if (overallTopThemes.includes(theme)) {
        timeMap[dateKey][theme] = (timeMap[dateKey][theme] || 0) + 1;
      }
    });
  });

  const chartData: MultiLineChartData[] = Object.entries(timeMap)
    .map(([date, themeCounts]) => ({
      date,
      ...themeCounts
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return chartData;
}

function getTopAnomalyTexts(feedback: FeedbackItem[], topN = 5): string[] {
  // Example anomaly: low confidence sentiment scores, or very strong sentiment for neutral topics
  // For now, let's use very low confidence or very high confidence if sentiment is neutral
  const anomalies = feedback.filter(item => item.confidence_score < 0.2 || (item.sentiment === 'neutral' && item.confidence_score > 0.8));
  return anomalies
    .sort((a,b) => Math.abs(0.5 - a.confidence_score) - Math.abs(0.5 - b.confidence_score) ) // Sort by extremity from 0.5
    .slice(0, topN)
    .map(item => item.text);
}

function getProblemHotspots(feedback: FeedbackItem[], topN = 5): ThemeVolume[] {
  const problemThemes: Record<string, number> = {};
  feedback.forEach(item => {
    if (item.is_problem || item.sentiment === 'negative') {
      item.ai_themes.forEach(theme => {
        if (theme && theme !== "error extracting themes") {
          problemThemes[theme] = (problemThemes[theme] || 0) + 1;
        }
      });
    }
  });
  return Object.entries(problemThemes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([theme, volume]) => ({ theme, volume }));
}

function getSuggestionHotspots(feedback: FeedbackItem[], topN = 5): ThemeVolume[] {
  const suggestionThemes: Record<string, number> = {};
  feedback.forEach(item => {
    if (item.is_suggestion) {
      item.ai_themes.forEach(theme => {
         if (theme && theme !== "error extracting themes") {
          suggestionThemes[theme] = (suggestionThemes[theme] || 0) + 1;
        }
      });
    }
  });
  return Object.entries(suggestionThemes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([theme, volume]) => ({ theme, volume }));
}

interface SentimentScoreData {
  score: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
}

function getOverallSentimentScore(feedback: FeedbackItem[]): SentimentScoreData {
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
  // Simplified score: (positive % - negative %) / 100, scaled to -10 to +10 or similar
  // Or a more nuanced score based on compound from VADER if available on FeedbackItem
  const score = Math.round(((positivePercentage - negativePercentage) / 100) * 10); 
  return { score, positivePercentage, negativePercentage, neutralPercentage };
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

// Helper component for simple list cards
interface SimpleListItem {
  id: string | number;
  text: string;
  value?: string | number;
}

interface ListCardProps {
  title: string;
  items: SimpleListItem[];
  icon?: React.ElementType;
  emptyText?: string;
}

const ListCard: React.FC<ListCardProps> = ({ title, items, icon: Icon, emptyText = "No data available." }) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow">
      <div className="flex items-center mb-4">
        {Icon && <Icon className="h-6 w-6 mr-3 text-primary" />}
        <h3 className="text-xl font-semibold text-card-foreground">{title}</h3>
      </div>
      {items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="text-sm text-muted-foreground flex justify-between">
              <span>{item.text}</span>
              {item.value && <span className="font-medium">{item.value}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
};

const RECHARTS_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [allFeedbackData, setAllFeedbackData] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derived states for the new components
  const [sectionCardsData, setSectionCardsData] = useState<any>({}); // Use a more specific type if available
  const [feedbackVolumeChartData, setFeedbackVolumeChartData] = useState<ChartItem[]>([]);

  // States for other data - can be used later or for more detailed views
  const [topThemesData, setTopThemesData] = useState<ThemeVolume[]>([]);
  const [sentimentDistributionData, setSentimentDistributionData] = useState<BarChartItem[]>([]);
  const [topSourcesData, setTopSourcesData] = useState<BarChartItem[]>([]);
  // Add more states here if you plan to display other processed data

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/processed_feedback.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: FeedbackItem[] = await response.json();
        setAllFeedbackData(data);

        // Process data for new components and other potentially useful data
        const overallSentiment = getOverallSentimentScore(data);
        const counts = getProblemSuggestionCounts(data);
        const volumeTrend = getFeedbackVolumeTrend(data, 'month');
        
        // Data for other components/future use
        setTopThemesData(getTopThemes(data));
        setSentimentDistributionData(getSentimentDistribution(data));
        setTopSourcesData(getTopSources(data));
        // You can call other processing functions here and set their states
        // e.g., getTopNegativeFeedbackTexts, getFeedbackOverTimeForTopThemes etc.

        setSectionCardsData({
          overallSentiment: overallSentiment,
          problems: counts.problems,
          suggestions: counts.suggestions,
          totalFeedback: data.length,
        });
        setFeedbackVolumeChartData(volumeTrend);
        console.log("Processed Feedback Volume Trend Data:", volumeTrend);

      } catch (error) {
        console.error("Failed to fetch or process feedback data:", error);
        // Handle error state in UI if needed
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Define columns for the DataTable
  const columns = useMemo<ColumnDef<FeedbackItem, any>[]>(() => [
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
    // Simple loading state, can be replaced with Skeleton components from dashboard-01 if desired
    return <div className="flex justify-center items-center h-screen">Loading dashboard data...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Page Title and Actions - similar to how PageContentLayout might have handled it */}
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
