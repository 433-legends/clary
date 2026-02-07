import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
  
  interface TopItem {
    text: string;
    count: number;
  }
  
  interface TopItemsCardProps {
    title: string;
    items: TopItem[];
  }
  
  export function TopItemsCard({ title, items }: TopItemsCardProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <ol className="space-y-3 text-sm">
              {items.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                    <span className="truncate text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="No data yet"
              description="No data available."
              compact
            />
          )}
        </CardContent>
      </Card>
    )
  } 
