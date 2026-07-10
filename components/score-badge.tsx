import { scoreTier } from "@/lib/scoring"
import { cn } from "@/lib/utils"

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const tier = scoreTier(score)
  const tones = {
    high: "bg-primary/15 text-primary ring-primary/30",
    mid: "bg-warning/15 text-warning ring-warning/30",
    low: "bg-muted text-muted-foreground ring-border",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-sm font-semibold ring-1 ring-inset tabular-nums",
        tones[tier.tone],
        className,
      )}
    >
      {score}
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{tier.label}</span>
    </span>
  )
}

export function EdgeTag({ edge }: { edge: number }) {
  const positive = edge > 0
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums",
        positive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {positive ? "+" : ""}
      {edge.toFixed(1)}% edge
    </span>
  )
}
