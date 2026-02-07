"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface ChartItem {
  label: string; // e.g., date or category
  value: number;
}

interface ChartAreaInteractiveProps {
  data: ChartItem[];
  title?: string;
  lineColor?: string;
}

export function ChartAreaInteractive({ 
  data, 
  title = "Feedback Volume Over Time",
  lineColor = "#F97316" // Changed to a direct orange hex code for testing
}: ChartAreaInteractiveProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">No data available for the chart.</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={lineColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)"/>
            <XAxis 
              dataKey="label" 
              stroke="hsl(var(--foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="hsl(var(--foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(dataMax + 10, 10)]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))", 
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: "0.875rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            />
            <Area
              type="monotone"
              dataKey="value" 
              stroke={lineColor} 
              strokeWidth={2} 
              fillOpacity={1}
              fill="url(#colorFill)"
              dot
              name={title}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 
