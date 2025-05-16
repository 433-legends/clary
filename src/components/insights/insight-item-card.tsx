"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap } from 'lucide-react';

export type InsightPriority = "Critical" | "High Priority" | "Positive" | "Neutral" | "Low";

interface InsightItemCardProps {
  title: string;
  description: string;
  mentions: number;
  generatedTime: string;
  confidence: number; // 0-100
  priority: InsightPriority;
  onViewClick?: () => void;
}

const priorityColors: Record<InsightPriority, { bg: string; text: string; border?: string }> = {
  "Critical": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-700/50" },
  "High Priority": { bg: "bg-yellow-100 dark:bg-yellow-700/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-200 dark:border-yellow-600/50" },
  "Positive": { bg: "bg-green-100 dark:bg-green-800/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-700/50" },
  "Neutral": { bg: "bg-slate-100 dark:bg-slate-700/50", text: "text-slate-600 dark:text-slate-300", border: "border-slate-200 dark:border-slate-600/50" },
  "Low": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-700/50" },
};

export function InsightItemCard({
  title,
  description,
  mentions,
  generatedTime,
  confidence,
  priority,
  onViewClick,
}: InsightItemCardProps) {
  const priorityStyle = priorityColors[priority] || priorityColors["Neutral"];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-150 ease-in-out">
      <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {description}
          </p>
          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{mentions} mentions</span>
            <span>•</span>
            <span>Generated {generatedTime}</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Confidence:</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2 sm:ml-4 mt-4 sm:mt-0 flex-shrink-0">
          <Badge 
            variant="outline"
            className={`px-2.5 py-0.5 text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border ? priorityStyle.border : 'border-transparent'}`}
          >
            {priority}
          </Badge>
          {onViewClick && (
            <Button variant="ghost" size="sm" onClick={onViewClick} className="mt-1 text-sm h-auto py-1 px-2">
              View
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 