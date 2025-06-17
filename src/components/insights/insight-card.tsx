"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap } from 'lucide-react'; // Placeholder for the lightning bolt icon
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type InsightPriority = "Critical" | "High Priority" | "Medium Priority" | "Low Priority" | "Positive" | "Neutral";

export interface InsightItem {
  id: string;
  icon?: React.ElementType;
  title: string;
  description: string;
  mentions: number;
  generatedTime: string; // e.g., "2 hours ago", "1 day ago"
  confidence: number; // 0 to 100
  priority: InsightPriority;
}

const priorityColors: Record<InsightPriority, string> = {
  "Critical": "bg-red-500 hover:bg-red-600",
  "High Priority": "bg-yellow-400 hover:bg-yellow-500 text-yellow-900",
  "Medium Priority": "bg-blue-500 hover:bg-blue-600",
  "Low Priority": "bg-gray-500 hover:bg-gray-600",
  "Positive": "bg-green-500 hover:bg-green-600",
  "Neutral": "bg-slate-500 hover:bg-slate-600",
};

interface InsightCardProps {
  insight: InsightItem;
  onViewClick?: (insightId: string) => void;
}

export function InsightCard({ insight, onViewClick }: InsightCardProps) {
  const IconComponent = insight.icon || Zap;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold leading-tight">{insight.title}</CardTitle>
          </div>
          <Badge variant="default" className={`${priorityColors[insight.priority]} text-xs text-white shrink-0`}>
            {insight.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground border-t pt-3">
        <div className="flex justify-between w-full items-center">
          <span>{insight.mentions} mentions</span>
          <span>{insight.generatedTime}</span>
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span>Confidence:</span>
            <span>{insight.confidence}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${insight.confidence}%` }}
            ></div>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full" 
          onClick={() => onViewClick && onViewClick(insight.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 