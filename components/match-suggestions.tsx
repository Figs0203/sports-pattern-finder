import { Lightbulb } from "lucide-react"
import { ScoreBadge, EdgeTag } from "@/components/score-badge"
import { categoryLabel } from "@/lib/labels"
import type { Odd, Opportunity } from "@/lib/types"

export function MatchSuggestions({
  opportunities,
  odds,
}: {
  opportunities: Opportunity[]
  odds: Odd[]
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Lightbulb className="size-4 text-primary" />
          <h2 className="font-semibold">Sugerencias del modelo</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {opportunities.length} señal{opportunities.length !== 1 ? "es" : ""}
          </span>
        </div>

        {opportunities.length > 0 ? (
          <ul className="divide-y divide-border">
            {opportunities.map((o) => (
              <li key={o.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {categoryLabel(o.category)}
                    </span>
                    <p className="text-pretty font-semibold leading-snug">{o.label}</p>
                  </div>
                  <ScoreBadge score={o.score} />
                </div>

                {o.reasoning ? (
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {o.reasoning}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <EdgeTag edge={o.edge} />
                  <Metric label="Prob. modelo" value={`${(o.model_prob * 100).toFixed(0)}%`} />
                  <Metric label="Cuota" value={o.bookmaker_price.toFixed(2)} />
                  <Metric
                    label="Cuota justa"
                    value={(1 / o.model_prob).toFixed(2)}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            El modelo no ha detectado valor suficiente en este partido.
          </p>
        )}
      </div>

      {odds.length > 0 ? <OddsTable odds={odds} /> : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </span>
  )
}

const MARKET_LABELS: Record<string, string> = {
  "1x2": "Resultado (1X2)",
  over_under_2_5: "Más/Menos 2.5",
  btts: "Ambos marcan",
  corners_over_9_5: "Córners +9.5",
}

const SELECTION_LABELS: Record<string, string> = {
  home: "Local",
  draw: "Empate",
  away: "Visitante",
  over: "Más",
  under: "Menos",
  yes: "Sí",
  no: "No",
}

function OddsTable({ odds }: { odds: Odd[] }) {
  const grouped = odds.reduce<Record<string, Odd[]>>((acc, o) => {
    ;(acc[o.market] ??= []).push(o)
    return acc
  }, {})

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold">Mercado</h2>
        <p className="text-xs text-muted-foreground">Cuotas de consenso vs. cuota justa del modelo</p>
      </div>
      <div className="divide-y divide-border">
        {Object.entries(grouped).map(([market, items]) => (
          <div key={market} className="px-5 py-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {MARKET_LABELS[market] ?? market}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((o) => {
                const value = o.fair_price != null && o.price > o.fair_price
                return (
                  <div
                    key={o.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                      value ? "border-primary/40 bg-primary/5" : "border-border"
                    }`}
                  >
                    <span className="text-muted-foreground">
                      {SELECTION_LABELS[o.selection] ?? o.selection}
                    </span>
                    <span className="font-mono font-semibold tabular-nums">
                      {o.price.toFixed(2)}
                    </span>
                    {o.fair_price != null ? (
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        (justa {o.fair_price.toFixed(2)})
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
