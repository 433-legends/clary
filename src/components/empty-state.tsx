import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  compact?: boolean
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10">
      <Image
        src="/images/empty-state.svg"
        alt=""
        width={compact ? 160 : 240}
        height={compact ? 148 : 221}
        className="mb-6"
        priority={false}
      />
      <h2 className={`font-semibold mb-2 text-balance ${compact ? "text-lg" : "text-2xl"}`}>
        {title}
      </h2>
      <p className={`text-muted-foreground mb-6 max-w-md text-pretty ${compact ? "text-xs" : "text-sm"}`}>
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button size={compact ? "sm" : "default"}>{actionLabel}</Button>
        </Link>
      )}
    </div>
  )
}
