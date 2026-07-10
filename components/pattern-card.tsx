import { TrendingUp } from "lucide-react"
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress"
import { categoryLabel } from "@/lib/labels"
import type { Pattern } from "@/lib/patterns"

const SIGNIFICANCE_STYLES = {
  high: {
    badge: "bg-primary/15 text-primary border-primary/30",
    bar: "bg-primary",
    label: "Alta confianza",
  },
  medium: {
    badge: "bg-warning/15 text-warning border-warning/30",
    bar: "bg-warning",
    label: "Confianza media",
  },
  low: {
    badge: "bg-muted text-muted-foreground border-border",
    bar: "bg-muted-foreground/40",
    label: "Baja confianza",
  },
}

export function PatternCard({ pattern }: { pattern: Pattern }) {
  const style = SIGNIFICANCE_STYLES[pattern.significance]
  const pct = Math.round(pattern.rate * 100)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {categoryLabel(pattern.category)}
          </span>
          <p className="mt-0.5 font-semibold leading-snug">{pattern.label}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* Hit rate bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Frecuencia</span>
          <span className="font-mono font-semibold tabular-nums">
            {pattern.hits}/{pattern.total} partidos ({pct}%)
          </span>
        </div>
        <Progress value={pct} className="w-full">
          <ProgressTrack className="h-2 bg-secondary">
            <ProgressIndicator className={`h-full transition-all ${style.bar}`} />
          </ProgressTrack>
        </Progress>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 rounded-lg bg-secondary p-3">
        <StatCell label="Edge medio" value={`+${pattern.avgEdge.toFixed(1)}%`} positive />
        <StatCell label="Score medio" value={pattern.avgScore.toString()} />
        <StatCell label="Z-score" value={pattern.zScore.toFixed(2)} positive={pattern.zScore >= 2} />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TrendingUp className="size-3.5 shrink-0" />
        Cuota media {pattern.avgPrice.toFixed(2)} · Mercado: {pattern.market}
      </div>
    </div>
  )
}

function StatCell({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-mono font-semibold tabular-nums ${positive ? "text-primary" : ""}`}>
        {value}
      </p>
    </div>
  )
}
