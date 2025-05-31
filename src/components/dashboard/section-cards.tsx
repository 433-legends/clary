import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Droplets, AlertTriangle, Lightbulb, History } from "lucide-react"

interface SectionCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ElementType;
}

function SectionCard({ title, value, description, icon: Icon }: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

interface SectionCardsData {
  overallSentiment?: {
    score: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  } | null;
  problems?: number;
  suggestions?: number;
  totalFeedback?: number;
}

export function SectionCards({ data }: { data: SectionCardsData }) {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:px-6">
      <SectionCard 
        title="Overall Sentiment" 
        value={data.overallSentiment ? `${data.overallSentiment.score > 0 ? '+' : ''}${data.overallSentiment.score}` : "N/A"}
        description={data.overallSentiment ? 
          `Pos: ${data.overallSentiment.positivePercentage}% Neg: ${data.overallSentiment.negativePercentage}% Neu: ${data.overallSentiment.neutralPercentage}%` 
          : "No sentiment data"
        }
        icon={Droplets} 
      />
      <SectionCard 
        title="Identified Problems" 
        value={data.problems ?? "N/A"} 
        description="Total issues highlighted" 
        icon={AlertTriangle} 
      />
      <SectionCard 
        title="Feature Suggestions" 
        value={data.suggestions ?? "N/A"} 
        description="New ideas proposed" 
        icon={Lightbulb} 
      />
      <SectionCard 
        title="Total Feedback" 
        value={data.totalFeedback ?? "N/A"} 
        description="Total items analyzed" 
        icon={History} 
      />
    </div>
  )
} 