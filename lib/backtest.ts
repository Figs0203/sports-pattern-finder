import type { BacktestBet, Strategy } from "@/lib/types"

export interface StrategyMetrics {
  totalBets: number
  wins: number
  losses: number
  winRate: number
  totalProfit: number
  roi: number
  yield: number
  avgStake: number
  // Profit curve as cumulative sums
  curve: number[]
}

export function computeMetrics(bets: BacktestBet[]): StrategyMetrics {
  if (bets.length === 0) {
    return {
      totalBets: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalProfit: 0,
      roi: 0,
      yield: 0,
      avgStake: 0,
      curve: [],
    }
  }

  const wins = bets.filter((b) => b.won).length
  const losses = bets.length - wins
  const totalProfit = bets.reduce((s, b) => s + b.profit, 0)
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0)
  const avgStake = totalStaked / bets.length

  // Build cumulative profit curve
  let cum = 0
  const curve = bets.map((b) => {
    cum += b.profit
    return Math.round(cum * 100) / 100
  })

  return {
    totalBets: bets.length,
    wins,
    losses,
    winRate: wins / bets.length,
    totalProfit: Math.round(totalProfit * 100) / 100,
    roi: totalStaked > 0 ? Math.round((totalProfit / totalStaked) * 10000) / 100 : 0,
    yield: totalStaked > 0 ? Math.round((totalProfit / totalStaked) * 10000) / 100 : 0,
    avgStake: Math.round(avgStake * 100) / 100,
    curve,
  }
}

export function groupBetsByStrategy(
  bets: BacktestBet[],
  strategies: Strategy[],
): Map<number, { strategy: Strategy; bets: BacktestBet[]; metrics: StrategyMetrics }> {
  const map = new Map<number, { strategy: Strategy; bets: BacktestBet[]; metrics: StrategyMetrics }>()
  for (const s of strategies) {
    const stratBets = bets.filter((b) => b.strategy_id === s.id)
    map.set(s.id, { strategy: s, bets: stratBets, metrics: computeMetrics(stratBets) })
  }
  return map
}
