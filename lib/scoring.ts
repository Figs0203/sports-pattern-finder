import type { MatchWithTeams, Player } from "@/lib/types"

// -------------------------------------------------------------------------
// Statistical models
// A lightweight Poisson-based engine that turns team/player form into
// probabilities, then compares them to bookmaker prices to find value.
// -------------------------------------------------------------------------

const HOME_ADVANTAGE = 1.12

function factorial(n: number): number {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

function poisson(k: number, lambda: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)
}

/** Expected goals for each side based on attack vs defense strength. */
export function expectedGoals(match: MatchWithTeams): { home: number; away: number } {
  const h = match.home_team
  const a = match.away_team
  // Blend the team's own scoring rate with the opponent's conceding rate.
  const home = ((h.avg_goals_for + a.avg_goals_against) / 2) * HOME_ADVANTAGE
  const away = (a.avg_goals_for + h.avg_goals_against) / 2
  return { home: round(home), away: round(away) }
}

/** Probability of total goals being over `line` (e.g. 2.5). */
export function overGoalsProb(match: MatchWithTeams, line = 2.5): number {
  const { home, away } = expectedGoals(match)
  const maxGoals = 8
  let under = 0
  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      if (i + j <= line) under += poisson(i, home) * poisson(j, away)
    }
  }
  return round(1 - under)
}

/** Both teams to score probability. */
export function bttsProb(match: MatchWithTeams): number {
  const { home, away } = expectedGoals(match)
  const pHomeScores = 1 - poisson(0, home)
  const pAwayScores = 1 - poisson(0, away)
  return round(pHomeScores * pAwayScores)
}

/** 1X2 probabilities. */
export function resultProbs(match: MatchWithTeams): { home: number; draw: number; away: number } {
  const { home, away } = expectedGoals(match)
  const maxGoals = 8
  let pHome = 0
  let pDraw = 0
  let pAway = 0
  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      const p = poisson(i, home) * poisson(j, away)
      if (i > j) pHome += p
      else if (i === j) pDraw += p
      else pAway += p
    }
  }
  return { home: round(pHome), draw: round(pDraw), away: round(pAway) }
}

/** Expected total corners and probability of going over a line. */
export function cornersModel(match: MatchWithTeams, line = 9.5): { expected: number; overProb: number } {
  const expected = match.home_team.avg_corners + match.away_team.avg_corners
  // Approximate the over probability with a normal-ish sigmoid around the line.
  const overProb = round(1 / (1 + Math.exp(-(expected - line) * 0.55)))
  return { expected: round(expected), overProb }
}

/** Expected cards and probability of going over a line. */
export function cardsModel(match: MatchWithTeams, line = 4.5): { expected: number; overProb: number } {
  const expected = match.home_team.avg_cards + match.away_team.avg_cards
  const overProb = round(1 / (1 + Math.exp(-(expected - line) * 0.6)))
  return { expected: round(expected), overProb }
}

/** Probability a player exceeds a shots line (Poisson on their per-90 average). */
export function playerShotsProb(player: Player, line = 2.5, useOnTarget = false): number {
  const lambda = useOnTarget ? player.avg_shots_on_target : player.avg_shots
  if (lambda <= 0) return 0
  const maxShots = 15
  let under = 0
  for (let k = 0; k <= Math.floor(line); k++) under += poisson(k, lambda)
  return round(1 - under)
}

// -------------------------------------------------------------------------
// Value / scoring
// -------------------------------------------------------------------------

/** Fair decimal odds from a probability. */
export function fairOdds(prob: number): number {
  if (prob <= 0) return 0
  return round(1 / prob)
}

/** Implied probability from decimal odds. */
export function impliedProb(price: number): number {
  if (price <= 0) return 0
  return round(1 / price)
}

/** Edge as a percentage: how much our probability beats the market's implied one. */
export function edgePct(modelProb: number, price: number): number {
  const implied = impliedProb(price)
  if (implied <= 0) return 0
  return round((modelProb - implied) * 100, 1)
}

/**
 * Confidence/value score 0-100.
 * Combines the raw edge, the model's confidence in the outcome, and the
 * expected value of a unit stake, so high-probability + high-edge picks
 * rise to the top.
 */
export function valueScore(modelProb: number, price: number): number {
  const edge = edgePct(modelProb, price) // percentage points
  const ev = modelProb * price - 1 // expected value per unit
  const edgeComponent = clamp(edge * 3.5, 0, 45) // up to 45 pts
  const confidenceComponent = clamp(modelProb * 40, 0, 40) // up to 40 pts
  const evComponent = clamp(ev * 60, 0, 15) // up to 15 pts
  return Math.round(clamp(edgeComponent + confidenceComponent + evComponent, 0, 100))
}

export function scoreTier(score: number): { label: string; tone: "high" | "mid" | "low" } {
  if (score >= 78) return { label: "Alta", tone: "high" }
  if (score >= 65) return { label: "Media", tone: "mid" }
  return { label: "Baja", tone: "low" }
}

function round(n: number, decimals = 3): number {
  const f = Math.pow(10, decimals)
  return Math.round(n * f) / f
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
