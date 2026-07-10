import { Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { MatchWithTeams } from "@/lib/types"

interface Model {
  xg: { home: number; away: number }
  over25: number
  over15: number
  over35: number
  btts: number
  result: { home: number; draw: number; away: number }
  corners: { expected: number; overProb: number }
  cards: { expected: number; overProb: number }
}

export function MatchModelPanel({ match, model }: { match: MatchWithTeams; model: Model }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Activity className="size-4 text-primary" />
          <h2 className="font-semibold">Modelo estadístico</h2>
        </div>

        <div className="space-y-5 px-5 py-4">
          {/* Expected goals */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Goles esperados (xG)
            </p>
            <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
              <div className="text-center">
                <p className="font-mono text-2xl font-semibold tabular-nums text-primary">
                  {model.xg.home.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{match.home_team.short_name}</p>
              </div>
              <span className="text-xs text-muted-foreground">xG</span>
              <div className="text-center">
                <p className="font-mono text-2xl font-semibold tabular-nums text-primary">
                  {model.xg.away.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{match.away_team.short_name}</p>
              </div>
            </div>
          </div>

          {/* 1X2 */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Probabilidad de resultado
            </p>
            <div className="grid grid-cols-3 gap-2">
              <ResultBox label="1" value={model.result.home} />
              <ResultBox label="X" value={model.result.draw} />
              <ResultBox label="2" value={model.result.away} />
            </div>
          </div>

          {/* Probability bars */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mercados de goles
            </p>
            <ProbBar label="Más de 1.5 goles" value={model.over15} />
            <ProbBar label="Más de 2.5 goles" value={model.over25} />
            <ProbBar label="Más de 3.5 goles" value={model.over35} />
            <ProbBar label="Ambos marcan" value={model.btts} />
          </div>
        </div>
      </div>

      {/* Corners & cards */}
      <div className="grid grid-cols-2 gap-4">
        <ExpectedCard
          title="Córners"
          expected={model.corners.expected}
          prob={model.corners.overProb}
          line="+9.5"
        />
        <ExpectedCard
          title="Tarjetas"
          expected={model.cards.expected}
          prob={model.cards.overProb}
          line="+4.5"
        />
      </div>
    </div>
  )
}

function ResultBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-secondary px-2 py-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-lg font-semibold tabular-nums">{(value * 100).toFixed(0)}%</p>
    </div>
  )
}

function ProbBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono font-medium tabular-nums">{(value * 100).toFixed(0)}%</span>
      </div>
      <Progress value={value * 100} className="h-1.5" />
    </div>
  )
}

function ExpectedCard({
  title,
  expected,
  prob,
  line,
}: {
  title: string
  expected: number
  prob: number
  line: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{expected.toFixed(1)}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">esperadas</p>
      <div className="mt-3 flex items-center justify-between rounded-md bg-secondary px-2.5 py-1.5 text-sm">
        <span className="text-muted-foreground">{line}</span>
        <span className="font-mono font-medium tabular-nums text-primary">
          {(prob * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
