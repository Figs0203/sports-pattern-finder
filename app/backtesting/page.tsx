import { LineChart } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { BacktestStrategyPanel } from "@/components/backtest-strategy-panel"
import { getStrategies, getBacktestBets } from "@/lib/data"
import { groupBetsByStrategy } from "@/lib/backtest"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Backtesting — GolValue",
  description: "Evalúa estrategias sobre datos históricos: ROI, yield, beneficio acumulado y registro de apuestas.",
}

export default async function BacktestingPage() {
  const [strategies, bets] = await Promise.all([getStrategies(), getBacktestBets()])

  const groupMap = groupBetsByStrategy(bets, strategies)
  const groups = strategies.map((s) => groupMap.get(s.id)!)

  const totalBets = bets.length
  const totalWins = bets.filter((b) => b.won).length
  const totalProfit = bets.reduce((s, b) => s + b.profit, 0)
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0)
  const globalRoi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0

  return (
    <>
      <PageHeader
        title="Backtesting"
        description="Evaluación de estrategias sobre datos históricos."
      />

      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Global summary */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total apuestas", value: totalBets.toString() },
            { label: "Aciertos", value: `${totalWins} / ${totalBets}` },
            {
              label: "ROI global",
              value: `${globalRoi >= 0 ? "+" : ""}${globalRoi.toFixed(1)}%`,
              positive: globalRoi >= 0,
            },
            {
              label: "Beneficio total",
              value: `${totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}u`,
              positive: totalProfit >= 0,
            },
          ].map(({ label, value, positive }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <LineChart className="size-3.5" />
                {label}
              </div>
              <p
                className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
                  positive === undefined
                    ? ""
                    : positive
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* Strategy panels */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <LineChart className="size-4" /> Estrategias ({strategies.length})
          </h2>
          <BacktestStrategyPanel groups={groups} />
        </section>
      </div>
    </>
  )
}
