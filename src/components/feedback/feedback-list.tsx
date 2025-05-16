import React from 'react';
import { FeedbackItem, FeedbackItemProps } from "./feedback-item"; // Relative import for local component

interface FeedbackListProps {
  feedbackItems: FeedbackItemProps[];
  title?: string;
}

export function FeedbackList({ feedbackItems, title = "Recent Feedback" }: FeedbackListProps) {
  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No feedback items to display.</p>
        {/* Optionally, add a CTA to connect a source if none are connected */}
      </div>
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