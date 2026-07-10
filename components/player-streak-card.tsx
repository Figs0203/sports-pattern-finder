import { ProgressTrack, ProgressIndicator, Progress } from "@/components/ui/progress"
import type { Streak } from "@/lib/player-history"

function streakTone(rate: number): {
  bar: string
  badge: string
  text: string
} {
  if (rate >= 0.75)
    return {
      bar: "bg-primary",
      badge: "bg-primary/15 text-primary border-primary/30",
      text: "text-primary",
    }
  if (rate >= 0.55)
    return {
      bar: "bg-warning",
      badge: "bg-warning/15 text-warning border-warning/30",
      text: "text-warning",
    }
  return {
    bar: "bg-muted-foreground/40",
    badge: "bg-muted/50 text-muted-foreground border-border",
    text: "text-muted-foreground",
  }
}

export function PlayerStreakCard({ streak }: { streak: Streak }) {
  const tone = streakTone(streak.rate)
  const pct = Math.round(streak.rate * 100)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug">{streak.label}</p>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums ${tone.badge}`}
        >
          {pct}%
        </span>
      </div>

      <Progress value={pct} className="w-full">
        <ProgressTrack className="h-1.5 bg-secondary">
          <ProgressIndicator className={`h-full transition-all ${tone.bar}`} />
        </ProgressTrack>
      </Progress>

      <p className="mt-2 text-xs text-muted-foreground">
        <span className={`font-semibold ${tone.text}`}>{streak.hits}</span> de{" "}
        <span className="font-semibold">{streak.total}</span> partidos
      </p>
    </div>
  )
}
