'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { InfoCard, BarChartItem } from '@/components/dashboard/info-card';

interface FeedbackItem {
  text: string;
  sentiment: string;
  keywords: string[];
  is_problem: boolean;
  is_suggestion: boolean;
  source: string;
  date_time: string;
  user_id: string;
  location: string;
  confidence_score: number;
}

function getTopKeywords(feedback: FeedbackItem[], topN = 10): BarChartItem[] {
  const freq: Record<string, number> = {};
  feedback.forEach(item => {
    item.keywords.forEach(kw => {
      freq[kw] = (freq[kw] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
  const max = sorted[0]?.[1] || 1;
  return sorted.map(([label, value]) => ({ label, value: Math.round((value / max) * 100) }));
}

function getTopSources(feedback: FeedbackItem[], topN = 10): BarChartItem[] {
  const freq: Record<string, number> = {};
  feedback.forEach(item => {
    const src = item.source.trim();
    freq[src] = (freq[src] || 0) + 1;
  });
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
  const max = sorted[0]?.[1] || 1;
  return sorted.map(([label, value]) => ({ label, value: Math.round((value / max) * 100) }));
}

function getTopNegative(feedback: FeedbackItem[], topN = 10): BarChartItem[] {
  const negatives = feedback.filter(item => item.sentiment === 'negative');
  return negatives.slice(0, topN).map(item => ({ label: item.text, value: Math.round(item.confidence_score * 100) }));
}

function getTopSuggestions(feedback: FeedbackItem[], topN = 10): BarChartItem[] {
  const suggestions = feedback.filter(item => item.is_suggestion);
  return suggestions.slice(0, topN).map(item => ({ label: item.text, value: Math.round(item.confidence_score * 100) }));
}

function getFeedbackOverTime(feedback: FeedbackItem[]): BarChartItem[] {
  // Group by month for simplicity
  const freq: Record<string, number> = {};
  feedback.forEach(item => {
    const date = new Date(item.date_time.trim());
    const label = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    freq[label] = (freq[label] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => a[0].localeCompare(b[0]));
  const max = sorted.reduce((m, [, v]) => Math.max(m, v), 1);
  return sorted.map(([label, value]) => ({ label, value: Math.round((value / max) * 100) }));
}

function getTopAnomalies(feedback: FeedbackItem[], topN = 10): BarChartItem[] {
  // For MVP, use the most extreme confidence scores
  const sorted = [...feedback].sort((a, b) => Math.abs(b.confidence_score - 0.5) - Math.abs(a.confidence_score - 0.5));
  return sorted.slice(0, topN).map(item => ({ label: item.text, value: Math.round(item.confidence_score * 100) }));
}

export default function HomePage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/processed_feedback.json')
      .then(res => res.json())
      .then(data => {
        setFeedback(data);
        setLoading(false);
      });
  }, []);

  const cardData = [
    {
      title: 'Top 10 themes',
      data: getTopKeywords(feedback),
    },
    {
      title: 'Top feedback channels',
      data: getTopSources(feedback),
    },
    {
      title: 'Top 10 negative feedbacks',
      data: getTopNegative(feedback),
    },
    {
      title: 'Top 10 suggested improvements',
      data: getTopSuggestions(feedback),
    },
    {
      title: 'Feedback over time',
      data: getFeedbackOverTime(feedback),
    },
    {
      title: 'Top 10 anomalies',
      data: getTopAnomalies(feedback),
    },
  ];

  return (
    <>
      {/* Page-specific header content */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          Generate report
        </Button>
      </div>

      {/* Dashboard cards grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div>Loading insights...</div>
        ) : (
          cardData.map(card => (
            <InfoCard key={card.title} title={card.title} chartData={card.data} />
          ))
        )}
      </div>
    </>
  );
}
