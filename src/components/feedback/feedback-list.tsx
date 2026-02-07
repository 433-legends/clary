import React from 'react';
import { FeedbackItem, FeedbackItemProps } from "./feedback-item"; // Relative import for local component
import { EmptyState } from '@/components/empty-state';

interface FeedbackListProps {
  feedbackItems: FeedbackItemProps[];
  title?: string;
}

export function FeedbackList({ feedbackItems, title = "Recent Feedback" }: FeedbackListProps) {
  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <EmptyState
        title="No feedback items"
        description="No feedback items to display yet."
        compact
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {feedbackItems.map((item) => (
          <FeedbackItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
} 
