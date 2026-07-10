import type { StrategyMetrics } from "@/lib/backtest"

const metrics = [
  {
    key: "totalBets" as const,
    label: "Apuestas",
    format: (v: number) => v.toString(),
    tone: "neutral",
  },
  {
    key: "winRate" as const,
    label: "Aciertos",
    format: (v: number) => `${(v * 100).toFixed(1)}%`,
    tone: (v: number) => (v >= 0.55 ? "success" : v >= 0.45 ? "warning" : "danger"),
  },
  {
    key: "totalProfit" as const,
    label: "Beneficio",
    format: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}u`,
    tone: (v: number) => (v > 0 ? "success" : "danger"),
  },
  {
    key: "roi" as const,
    label: "ROI",
    format: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
    tone: (v: number) => (v > 0 ? "success" : "danger"),
  },
  {
    key: "yield" as const,
    label: "Yield",
    format: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
    tone: (v: number) => (v > 0 ? "success" : "danger"),
  },
] as const

type ToneName = "neutral" | "success" | "warning" | "danger"

function toneClass(tone: ToneName): string {
  switch (tone) {
    case "success":
      return "text-primary"
    case "warning":
      return "text-warning"
    case "danger":
      return "text-destructive"
    default:
      return "text-foreground"
  }
}

export function BacktestMetricsBar({ metrics: m }: { metrics: StrategyMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {metrics.map(({ key, label, format, tone }) => {
        const value = m[key] as number
        const resolvedTone: ToneName =
          typeof tone === "function" ? (tone(value) as ToneName) : (tone as ToneName)
        return (
          <div key={key} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className={`mt-1 font-mono text-xl font-bold tabular-nums ${toneClass(resolvedTone)}`}>
              {format(value)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
