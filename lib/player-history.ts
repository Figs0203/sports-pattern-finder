import type { Player } from "@/lib/types"

export interface PlayerMatchLog {
  index: number
  opponent: string
  date: string
  shots: number
  shotsOnTarget: number
  goals: number
  assists: number
  passes: number
  fouls: number
  minutes: number
}

const OPPONENTS = [
  "MCI", "LIV", "ARS", "CHE", "MUN", "TOT", "NEW", "WHU",
  "BAR", "RMA", "ATM", "ATH", "JUV", "INT", "MIL", "NAP",
]

// Deterministic pseudo-random generator seeded by player id + index.
function seeded(id: number, i: number): number {
  const x = Math.sin(id * 12.9898 + i * 78.233) * 43758.5453
  return x - Math.floor(x)
}

// Poisson sample using inverse transform with a deterministic uniform.
function poissonSample(lambda: number, u: number): number {
  if (lambda <= 0) return 0
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  let rand = u
  do {
    k++
    p *= rand
    rand = (rand * 1.3 + 0.37) % 1
  } while (p > L && k < 20)
  return k - 1
}

/** Build a deterministic recent-match log from a player's season averages. */
export function buildPlayerHistory(player: Player, count = 13): PlayerMatchLog[] {
  const logs: PlayerMatchLog[] = []
  const teamShort = player.team_id ? String(player.team_id) : ""

  for (let i = 0; i < count; i++) {
    const shots = poissonSample(player.avg_shots, seeded(player.id, i))
    const sot = Math.min(shots, poissonSample(player.avg_shots_on_target, seeded(player.id, i + 100)))
    const goalRate = player.appearances > 0 ? player.goals / player.appearances : 0.2
    const assistRate = player.appearances > 0 ? player.assists / player.appearances : 0.1
    const goals = seeded(player.id, i + 200) < goalRate ? (sot > 0 ? 1 : 0) : 0
    const extraGoal = seeded(player.id, i + 250) < goalRate * 0.3 && sot > 1 ? 1 : 0
    const assists = seeded(player.id, i + 300) < assistRate ? 1 : 0

    const daysAgo = (count - i) * 4
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)

    logs.push({
      index: i,
      opponent: OPPONENTS[(player.id + i) % OPPONENTS.length].replace(teamShort, "OPP"),
      date: date.toISOString(),
      shots,
      shotsOnTarget: sot,
      goals: goals + extraGoal,
      assists,
      passes: Math.round(player.avg_passes * (0.8 + seeded(player.id, i + 400) * 0.4)),
      fouls: poissonSample(player.avg_fouls, seeded(player.id, i + 500)),
      minutes: seeded(player.id, i + 600) > 0.15 ? 90 : 60 + Math.round(seeded(player.id, i + 700) * 25),
    })
  }
  return logs
}

export interface Streak {
  label: string
  hits: number
  total: number
  rate: number
}

/** Compute hit-rate streaks over a stat line (e.g. "2+ tiros"). */
export function computeStreaks(logs: PlayerMatchLog[]): Streak[] {
  const total = logs.length
  const streaks: { label: string; test: (l: PlayerMatchLog) => boolean }[] = [
    { label: "1+ tiro al arco", test: (l) => l.shotsOnTarget >= 1 },
    { label: "2+ tiros totales", test: (l) => l.shots >= 2 },
    { label: "3+ tiros totales", test: (l) => l.shots >= 3 },
    { label: "Marcó gol", test: (l) => l.goals >= 1 },
    { label: "1+ falta cometida", test: (l) => l.fouls >= 1 },
  ]

  return streaks
    .map((s) => {
      const hits = logs.filter(s.test).length
      return { label: s.label, hits, total, rate: total > 0 ? hits / total : 0 }
    })
    .sort((a, b) => b.rate - a.rate)
}
