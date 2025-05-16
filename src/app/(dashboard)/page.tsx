import React from 'react';
import { FeedbackList } from '@/components/feedback/feedback-list';
import { FeedbackItemProps } from '@/components/feedback/feedback-item';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Placeholder data - in a real app, this would come from an API
const placeholderFeedbackItems: FeedbackItemProps[] = [
  {
    id: "1",
    source: "Zendesk",
    content: "The new invoicing feature is confusing. I can't find where to download my past invoices easily.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    sentiment: "negative",
    tags: ["invoicing", "ux"],
  },
  {
    id: "2",
    source: "Slack",
    content: "Loving the quick search! It makes finding customer conversations so much faster.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    sentiment: "positive",
    tags: ["search", "performance"],
  },
  {
    id: "3",
    source: "Gong",
    content: "During the sales demo, the client mentioned that the reporting dashboard looks very comprehensive.",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    sentiment: "positive",
    tags: ["reporting", "sales-demo"],
  },
  {
    id: "4",
    source: "Zendesk",
    content: "I'm not sure how to integrate my calendar with the scheduling tool. The instructions are not clear.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    sentiment: "neutral",
    tags: ["calendar-integration", "documentation"],
  },
];

export default function DashboardPage() {
  // In a real app, you'd fetch data and handle loading/error states
  const feedbackItems = placeholderFeedbackItems;
  const hasConnectedTools = true; // Placeholder: replace with actual logic

  if (!hasConnectedTools) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Insights.app!</h2>
        <p className="mb-6 text-muted-foreground">Connect your tools to start aggregating feedback.</p>
        <Link href="/onboarding"> {/* Link to onboarding within the same (dashboard) group */}
          <Button>Connect Tools</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Feedback Insights</h1>
        {/* Placeholder for global filters or actions */}
        <Button variant="outline">Filter Insights</Button>
      </div>
      <FeedbackList feedbackItems={feedbackItems} />
    </div>
  );
} 