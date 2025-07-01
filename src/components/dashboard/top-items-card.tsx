import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
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
                    <span className="truncate text-muted-foreground">{`${index + 1}. ${item.text}`}</span>
                    <span className="font-medium">{item.count}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">No data available.</p>
          )}
        </CardContent>
      </Card>
    )
  } 