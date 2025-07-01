import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
  interface Source {
      name: string;
      count: number;
  }
  
  interface TopSourcesCardProps {
    title?: string;
    sources: Source[];
  }
  
  export function TopSourcesCard({ title = "Top Feedback Sources", sources }: TopSourcesCardProps) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length > 0 ? (
            <ul className="space-y-3 text-sm">
                {sources.map((source, index) => (
                    <li key={index} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{source.name}</span>
                        <span className="font-medium">{source.count}</span>
                    </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No source data available.</p>
          )}
        </CardContent>
      </Card>
    )
  } 