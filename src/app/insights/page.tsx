"use client";

import React from 'react';
import { PageContentLayout } from '@/components/layout/page-content-layout';
import { InsightCard, type InsightItem } from '@/components/insights/insight-card';
import { Zap, FileText, Lightbulb } from 'lucide-react'; // Example icons for insights
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Sample data based on the image and our InsightItem structure
const sampleInsights: InsightItem[] = [
  {
    id: 'insight-1',
    icon: Zap, // Default icon, or you can specify per insight
    title: 'Dashboard Performance Issues',
    description: '32% increase in complaints about dashboard loading times over the past 2 weeks.',
    mentions: 18,
    generatedTime: '2 hours ago',
    confidence: 75, // Percentage
    priority: 'Critical',
  },
  {
    id: 'insight-2',
    icon: FileText,
    title: 'Export Feature Requests',
    description: 'Multiple enterprise customers have requested CSV and PDF export options for reports.',
    mentions: 28,
    generatedTime: '5 hours ago',
    confidence: 60,
    priority: 'High Priority',
  },
  {
    id: 'insight-3',
    icon: Lightbulb,
    title: 'Mobile App Positive Feedback',
    description: 'The recent mobile app update has received overwhelmingly positive feedback, with a 92% satisfaction rate.',
    mentions: 38,
    generatedTime: '1 day ago',
    confidence: 90,
    priority: 'Positive',
  },
  // Add more sample insights as needed
  {
    id: 'insight-4',
    title: 'Onboarding Confusion - Step 3',
    description: 'Users frequently drop off or report confusion during the third step of the onboarding process.',
    mentions: 12,
    generatedTime: '3 days ago',
    confidence: 80,
    priority: 'High Priority',
  },
];

export default function InsightsPage() {
  const handleViewDetails = (insightId: string) => {
    console.log("View details for insight:", insightId);
    // Here you would typically navigate to a detailed view or show a modal
    // with the underlying feedback items related to this insight.
  };

  return (
    <PageContentLayout title="Insights">
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {sampleInsights.map((insight) => (
          <InsightCard 
            key={insight.id} 
            insight={insight} 
            onViewClick={handleViewDetails} 
          />
        ))}
      </div>
      {sampleInsights.length === 0 && (
        <div className="p-8 border-2 border-dashed border-muted rounded-lg text-center mt-6">
          <p className="text-muted-foreground">
            No insights generated yet. Check back after new feedback is processed.
          </p>
        </div>
      )}
    </PageContentLayout>
  );
} 