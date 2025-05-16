import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface FeedbackItemProps {
  id: string;
  source: string;
  content: string;
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  tags?: string[];
}

export function FeedbackItem({ item }: { item: FeedbackItemProps }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Feedback #{item.id.substring(0, 6)}</CardTitle>
          <Badge variant={item.source === 'Zendesk' ? 'default' : item.source === 'Slack' ? 'secondary' : 'outline'}>
            {item.source}
          </Badge>
        </div>
        <CardDescription>{new Date(item.timestamp).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {item.content}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {item.sentiment && (
          <Badge 
            variant={item.sentiment === 'positive' ? 'default' : item.sentiment === 'negative' ? 'destructive' : 'outline'}
            className={item.sentiment === 'positive' ? 'bg-green-500 hover:bg-green-600 text-white' : item.sentiment === 'negative' ? '' : 'border-yellow-500 text-yellow-600'}
          >
            Sentiment: {item.sentiment}
          </Badge>
        )}
        {item.tags && item.tags.map(tag => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </CardFooter>
    </Card>
  );
} 