import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface BarChartItem {
  label: string;
  value: number; // Represents percentage for width
  color?: string; // Tailwind color class e.g., 'bg-blue-500'
}

interface InfoCardProps {
  title: string;
  children?: React.ReactNode; // Keep children for other content if needed
  chartData?: BarChartItem[];
  className?: string;
}

const defaultColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-cyan-500',
];

export function InfoCard({ title, children, chartData, className }: InfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData && chartData.length > 0 ? (
          <div className="space-y-3 pt-2">
            {chartData.map((item, index) => (
              <div key={item.label} className="flex flex-col text-xs">
                <span className="mb-1 text-foreground/90">{item.label}</span>
                <div className="h-2.5 w-full bg-muted rounded-full">
                  <div 
                    className={`h-2.5 rounded-full ${item.color || defaultColors[index % defaultColors.length]}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : children}
      </CardContent>
    </Card>
  );
} 