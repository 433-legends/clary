'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { History, TrendingUp, AlertTriangle, Lightbulb, MessageSquare, ListChecks, Users, BarChartBig, Droplets } from 'lucide-react';
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
        if (theme && theme !== "Error extracting themes") {
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
  score: number; // e.g., -1 to 1 or 0-100
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
  // Score from -1 (all negative) to 1 (all positive)
  const score = (positiveCount - negativeCount) / total; 
  
  return {
    score: parseFloat(score.toFixed(2)), // Normalized score
    positivePercentage: Math.round((positiveCount / total) * 100),
    negativePercentage: Math.round((negativeCount / total) * 100),
    neutralPercentage: Math.round((neutralCount / total) * 100),
  };
}

function getFeedbackVolumeTrend(feedback: FeedbackItem[], granularity: 'month' | 'week' = 'month'): BarChartItem[] {
  const freq: Record<string, number> = {}; // Using BarChartItem structure for compatibility if needed
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
    .sort((a, b) => a[0].localeCompare(b[0])) // Sort by date
    .map(([label, value]) => ({ label, value })); // Raw counts
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
    <div className="rounded-xl border bg-card text-card-foreground shadow col-span-1">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium flex items-center">
          {Icon && <Icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          {title}
        </h3>
      </div>
      <div className="p-6 pt-0">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between text-xs items-center">
                <span className="truncate pr-2" title={item.text}>{item.text}</span>
                {item.value && <span className="font-semibold flex-shrink-0">{item.value}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        )}
      </div>
    </div>
  );
};

const RECHARTS_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [topThemes, setTopThemes] = useState<ThemeVolume[]>([]);
  const [sentimentDistribution, setSentimentDistribution] = useState<BarChartItem[]>([]);
  const [problemSuggestionCounts, setProblemSuggestionCounts] = useState<{ problems: number; suggestions: number }>({ problems: 0, suggestions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [topSources, setTopSources] = useState<BarChartItem[]>([]);
  const [topNegativeTexts, setTopNegativeTexts] = useState<string[]>([]);
  const [topSuggestionTexts, setTopSuggestionTexts] = useState<string[]>([]);
  const [themeTrends, setThemeTrends] = useState<MultiLineChartData[]>([]);
  const [anomalyTexts, setAnomalyTexts] = useState<string[]>([]);
  const [problemHotspots, setProblemHotspots] = useState<ThemeVolume[]>([]);
  const [suggestionHotspots, setSuggestionHotspots] = useState<ThemeVolume[]>([]);
  const [overallSentiment, setOverallSentiment] = useState<SentimentScoreData | null>(null);
  const [volumeTrend, setVolumeTrend] = useState<BarChartItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await fetch('/processed_feedback.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: FeedbackItem[] = await response.json();
        setFeedbackData(data);
        setTopThemes(getTopThemes(data));
        setSentimentDistribution(getSentimentDistribution(data));
        setProblemSuggestionCounts(getProblemSuggestionCounts(data));
        setTopSources(getTopSources(data));
        setTopNegativeTexts(getTopNegativeFeedbackTexts(data));
        setTopSuggestionTexts(getTopSuggestionTexts(data));
        setThemeTrends(getFeedbackOverTimeForTopThemes(data, 5, 'month'));
        setAnomalyTexts(getTopAnomalyTexts(data));
        setProblemHotspots(getProblemHotspots(data));
        setSuggestionHotspots(getSuggestionHotspots(data));
        setOverallSentiment(getOverallSentimentScore(data));
        setVolumeTrend(getFeedbackVolumeTrend(data, 'month'));
      } catch (error) {
        console.error("Failed to fetch or process feedback data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }
  
  const topThemeNames = themeTrends.length > 0 ? Object.keys(themeTrends[0]).filter(key => key !== 'date') : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Insights Dashboard</h2>
        <Button>
          <History className="mr-2 h-4 w-4" /> Sync with Sources
        </Button>
      </div>

      {/* Main Grid - Adjust md:grid-cols- as needed */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Row 1: Overview Cards */}
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-1 md:col-span-2 lg:col-span-1">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Overall Sentiment</h3>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            {overallSentiment && (
              <>
                <div className="text-2xl font-bold">{overallSentiment.score > 0 ? '+' : ''}{overallSentiment.score}</div>
                <p className="text-xs text-muted-foreground">
                  Positive: {overallSentiment.positivePercentage}% | Negative: {overallSentiment.negativePercentage}% | Neutral: {overallSentiment.neutralPercentage}%
                </p>
              </>
            )}
          </div>
        </div>
        <InfoCard title="Identified Problems" className="col-span-1">
            <div className="text-2xl font-bold">{problemSuggestionCounts.problems}</div>
            <p className="text-xs text-muted-foreground">Total issues highlighted.</p>
        </InfoCard>
        <InfoCard title="Feature Suggestions" className="col-span-1">
            <div className="text-2xl font-bold">{problemSuggestionCounts.suggestions}</div>
            <p className="text-xs text-muted-foreground">New ideas proposed.</p>
        </InfoCard>
        <InfoCard title="Total Feedback" className="col-span-1">
             <div className="text-2xl font-bold">{feedbackData.length}</div>
             <p className="text-xs text-muted-foreground">Total items analyzed.</p>
        </InfoCard>

        {/* Top Themes (List) */}
        <ListCard title="Top Themes" items={topThemes.map(t => ({id: t.theme, text: t.theme, value: t.volume }))} icon={TrendingUp} />
        
        {/* Problem Hotspots */}
        <ListCard title="Problem Hotspots" items={problemHotspots.map(t => ({ id: t.theme, text: t.theme, value: t.volume }))} icon={AlertTriangle} />

        {/* Suggestion Hotspots */}
        <ListCard title="Suggestion Hotspots" items={suggestionHotspots.map(t => ({ id: t.theme, text: t.theme, value: t.volume }))} icon={Lightbulb} />
        
        {/* Top Feedback Sources - using InfoCard for its bar chart style */}
        <InfoCard title="Top Feedback Sources" chartData={topSources} className="col-span-1 md:col-span-1" />

        {/* Top Negative Feedback Texts */}
        <ListCard title="Top Negative Feedback" items={topNegativeTexts.map((text, i) => ({ id: i, text: text }))} icon={MessageSquare} emptyText="No negative feedback found." />

        {/* Top Suggestion Texts */}
        <ListCard title="Top Suggestions" items={topSuggestionTexts.map((text, i) => ({ id: i, text: text }))} icon={ListChecks} emptyText="No suggestions found." />

        {/* Top Anomaly Texts */}
        <ListCard title="Top Anomalies" items={anomalyTexts.map((text, i) => ({ id: i, text: text }))} icon={Users} emptyText="No anomalies identified." />
        
        {/* Sentiment Distribution (Pie Chart or existing Bar Chart) */}
        {/* Using existing InfoCard for bar chart for now */}
        <InfoCard title="Sentiment Distribution" chartData={sentimentDistribution} className="col-span-1" />


        {/* Row 2: Trend Charts - These might need more horizontal space */}
        {themeTrends.length > 0 && (
            <div className="rounded-xl border bg-card text-card-foreground shadow md:col-span-2 lg:col-span-2 xl:col-span-2 min-h-[300px]">
                <div className="p-6 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Top Themes Over Time</h3>
                </div>
                <div className="p-6 pt-0 h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={themeTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" style={{ fontSize: '0.7rem' }} />
                        <YAxis style={{ fontSize: '0.7rem' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        {topThemeNames.map((themeName, index) => (
                            <Line key={themeName} type="monotone" dataKey={themeName} stroke={RECHARTS_COLORS[index % RECHARTS_COLORS.length]} strokeWidth={2} name={themeName} />
                        ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {volumeTrend.length > 0 && (
            <div className="rounded-xl border bg-card text-card-foreground shadow md:col-span-2 lg:col-span-2 xl:col-span-2 min-h-[300px]">
                <div className="p-6 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Feedback Volume Over Time</h3>
                </div>
                <div className="p-6 pt-0 h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={volumeTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" style={{ fontSize: '0.7rem' }} />
                        <YAxis style={{ fontSize: '0.7rem' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
                        <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        <Line type="monotone" dataKey="value" stroke={RECHARTS_COLORS[0]} strokeWidth={2} name="Volume" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
