"use client"

import { useState } from "react"
import { BacktestMetricsBar } from "@/components/backtest-metrics-bar"
import { cn } from "@/lib/utils"
import type { BacktestBet, Strategy } from "@/lib/types"
import type { StrategyMetrics } from "@/lib/backtest"

interface StrategyGroup {
  strategy: Strategy
  bets: BacktestBet[]
  metrics: StrategyMetrics
}

// Inline SVG P&L curve — no chart lib needed
function ProfitCurve({ curve }: { curve: number[] }) {
  if (curve.length < 2)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin suficientes datos para trazar curva.
      </p>
    )

  const W = 600
  const H = 160
  const pad = { top: 12, right: 12, bottom: 28, left: 44 }
  const minV = Math.min(0, ...curve)
  const maxV = Math.max(0, ...curve)
  const range = maxV - minV || 1

  const toX = (i: number) =>
    pad.left + ((i / (curve.length - 1)) * (W - pad.left - pad.right))
  const toY = (v: number) =>
    pad.top + ((maxV - v) / range) * (H - pad.top - pad.bottom)

  const zeroY = toY(0)

  // Build path
  const pts = curve.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`)
  const path = pts.join(" ")

  // Fill area
  const lastX = toX(curve.length - 1)
  const fillPath = `${path} L${lastX},${zeroY} L${toX(0)},${zeroY} Z`

  const isPositive = curve[curve.length - 1] >= 0

  // Y-axis ticks
  const ticks = [minV, minV + range * 0.25, minV + range * 0.5, minV + range * 0.75, maxV]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Curva de beneficio acumulado">
      {/* Zero line */}
      <line
        x1={pad.left}
        y1={zeroY}
        x2={W - pad.right}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeDasharray="4 3"
        className="text-border"
      />

      {/* Fill */}
      <path
        d={fillPath}
        className={isPositive ? "fill-primary" : "fill-destructive"}
        fillOpacity={0.08}
      />

      {/* Line */}
      <path
        d={path}
        fill="none"
        className={isPositive ? "stroke-primary" : "stroke-destructive"}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Y axis ticks */}
      {ticks.map((t, i) => (
        <text
          key={i}
          x={pad.left - 6}
          y={toY(t) + 4}
          textAnchor="end"
          className="fill-muted-foreground font-mono text-[9px]"
        >
          {t.toFixed(1)}
        </text>
      ))}

      {/* X axis label */}
      <text
        x={W / 2}
        y={H - 2}
        textAnchor="middle"
        className="fill-muted-foreground text-[9px]"
      >
        Apuestas
      </text>
    </svg>
  )
}

function BetsTable({ bets }: { bets: BacktestBet[] }) {
  const sorted = [...bets].sort(
    (a, b) => new Date(b.settled_at).getTime() - new Date(a.settled_at).getTime(),
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Selección", "Cuota", "Score", "Edge", "Stake", "Resultado", "Profit"].map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((b) => (
            <tr key={b.id} className="hover:bg-accent/30 transition-colors">
              <td className="px-4 py-2.5 font-medium">{b.label}</td>
              <td className="px-4 py-2.5 font-mono tabular-nums">{b.price.toFixed(2)}</td>
              <td className="px-4 py-2.5 font-mono tabular-nums">{b.score}</td>
              <td className="px-4 py-2.5 font-mono tabular-nums text-primary">
                +{b.edge.toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 font-mono tabular-nums">{b.stake}u</td>
              <td className="px-4 py-2.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    b.won
                      ? "bg-primary/15 text-primary"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {b.won ? "✓ Acierto" : "✗ Fallo"}
                </span>
              </td>
              <td
                className={`px-4 py-2.5 font-mono font-semibold tabular-nums ${
                  b.profit >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {b.profit >= 0 ? "+" : ""}
                {b.profit.toFixed(2)}u
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function BacktestStrategyPanel({ groups }: { groups: StrategyGroup[] }) {
  const [activeId, setActiveId] = useState<number>(groups[0]?.strategy.id ?? 0)

  const active = groups.find((g) => g.strategy.id === activeId) ?? groups[0]

  if (!active) {
    return (
      <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No hay estrategias de backtesting registradas.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Strategy selector tabs */}
      <div className="flex flex-wrap gap-2">
        {groups.map(({ strategy, metrics }) => (
          <button
            key={strategy.id}
            onClick={() => setActiveId(strategy.id)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              activeId === strategy.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {strategy.name}
            <span className="ml-2 font-mono text-xs opacity-70">
              {metrics.roi >= 0 ? "+" : ""}
              {metrics.roi.toFixed(1)}%
            </span>
          </button>
        ))}
      </div>

      {/* Active strategy */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <p className="font-semibold">{active.strategy.name}</p>
          {active.strategy.description ? (
            <p className="text-sm text-muted-foreground">{active.strategy.description}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Score mín. {active.strategy.min_score}</span>
            <span>Edge mín. {active.strategy.min_edge}%</span>
            <span>Stake {active.strategy.stake}u</span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <BacktestMetricsBar metrics={active.metrics} />

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Curva de P&L acumulado
            </p>
            <ProfitCurve curve={active.metrics.curve} />
          </div>

          {active.bets.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Registro de apuestas
              </p>
              <BetsTable bets={active.bets} />
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Esta estrategia aún no tiene apuestas registradas.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
