import {
  IconAlertTriangle,
  IconHistory,
  IconDroplets,
  IconBulb,
  IconTrendingUp,
  IconTrendingDown,
  IconStar,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsData {
  overallSentiment?: {
    score: number
    positivePercentage: number
    negativePercentage: number
    neutralPercentage: number
  } | null
  problems?: number
  suggestions?: number
  positives?: number
  totalFeedback?: number
}

export function SectionCards({ data }: { data: SectionCardsData }) {
  const sentimentScore = data.overallSentiment?.score ?? 0
  const sentimentTrendIcon =
    sentimentScore > 0 ? (
      <IconTrendingUp className="size-4" />
    ) : (
      <IconTrendingDown className="size-4" />
    )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Overall Sentiment</CardDescription>
          <CardTitle className="font-mono tracking-wide text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {sentimentScore > 0 ? "+" : ""}
            {sentimentScore.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconDroplets size={16} />
              Sentiment
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sentimentScore > 0 ? "Trending positive" : "Trending negative"}
            {sentimentTrendIcon}
          </div>
          <div className="text-muted-foreground">
            {`Pos: ${data.overallSentiment?.positivePercentage}% Neg: ${data.overallSentiment?.negativePercentage}%`}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Issues</CardDescription>
          <CardTitle className="font-mono tracking-wide text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.problems ?? "N/A"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconAlertTriangle size={16} />
              Problems
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Areas needing attention
            <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total issues highlighted
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Requests</CardDescription>
          <CardTitle className="font-mono tracking-wide text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.suggestions ?? "N/A"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconBulb size={16} />
              Requests
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Opportunities for growth
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">New ideas proposed by users</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>CSAT Score</CardDescription>
          <CardTitle className="font-mono text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.overallSentiment?.positivePercentage.toFixed(1) ?? "N/A"}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconStar size={16} />
              CSAT
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Customer satisfaction
            <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Percentage of satisfied users
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 