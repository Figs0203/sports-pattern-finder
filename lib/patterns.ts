// -------------------------------------------------------------------------
// Pattern discovery engine.
//
// Works purely on the stored opportunities table (which is continuously fed
// by the scoring engine). No LLM, no generative AI — pure statistics.
//
// Algorithm:
//   1. Group opportunities by (category, selection) — each group is a
//      "pattern" (e.g., "player_shots / over_2.5").
//   2. For each group compute:
//      - hit rate  = opportunities with score >= threshold / total
//      - avg edge  = mean edge across all samples
//      - z-score   = measures statistical significance vs. a 50% base rate
//   3. Filter: N >= MIN_SAMPLE and |z-score| >= MIN_Z
//   4. Sort by a composite value score.
// -------------------------------------------------------------------------

import type { OpportunityCategory } from "@/lib/types"

export interface Pattern {
  id: string
  category: string
  market: string
  label: string
  hits: number
  total: number
  rate: number
  avgEdge: number
  avgScore: number
  avgPrice: number
  zScore: number
  significance: "high" | "medium" | "low"
}

interface RawOpp {
  category: OpportunityCategory | string
  market: string
  selection: string
  label: string
  score: number
  edge: number
  model_prob: number
  bookmaker_price: number
}

const MIN_SAMPLE = 5   // lower threshold so seed data shows results
const MIN_Z = 1.0      // ~84th percentile one-tailed

function significanceTier(z: number): Pattern["significance"] {
  if (z >= 2.0) return "high"
  if (z >= 1.5) return "medium"
  return "low"
}

/** Compute z-score for a proportion vs. the 0.5 null hypothesis. */
function zScore(hits: number, total: number): number {
  if (total === 0) return 0
  const p = hits / total
  const se = Math.sqrt((0.5 * 0.5) / total) // SE under H0: p=0.5
  return (p - 0.5) / se
}

export function discoverPatterns(opps: RawOpp[]): Pattern[] {
  // Group by a stable key: category + market + selection
  const groups = new Map<string, RawOpp[]>()

  for (const o of opps) {
    const key = `${o.category}|${o.market}|${o.selection}`
    const arr = groups.get(key) ?? []
    arr.push(o)
    groups.set(key, arr)
  }

  const patterns: Pattern[] = []

  for (const [key, items] of groups) {
    if (items.length < MIN_SAMPLE) continue

    // "hit" = opportunity has a positive edge (model beats implied odds)
    const hits = items.filter((o) => o.edge > 0).length
    const total = items.length
    const rate = hits / total
    const avgEdge = items.reduce((s, o) => s + o.edge, 0) / total
    const avgScore = items.reduce((s, o) => s + o.score, 0) / total
    const avgPrice = items.reduce((s, o) => s + o.bookmaker_price, 0) / total
    const z = zScore(hits, total)

    if (z < MIN_Z) continue

    const [category, market, selection] = key.split("|")
    // Use the most-common label as the pattern label
    const labelCounts = new Map<string, number>()
    for (const o of items) labelCounts.set(o.label, (labelCounts.get(o.label) ?? 0) + 1)
    const label = [...labelCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]

    patterns.push({
      id: key,
      category,
      market,
      label,
      hits,
      total,
      rate,
      avgEdge: Math.round(avgEdge * 10) / 10,
      avgScore: Math.round(avgScore),
      avgPrice: Math.round(avgPrice * 100) / 100,
      zScore: Math.round(z * 100) / 100,
      significance: significanceTier(z),
    })
  }

  // Sort by composite: z-score * avg edge
  return patterns.sort((a, b) => b.zScore * b.avgEdge - a.zScore * a.avgEdge)
}
