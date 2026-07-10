// -------------------------------------------------------------------------
// Data transformers: raw API responses → internal domain types.
//
// These functions map the external API shapes (API-Football v3 and
// The Odds API v4) to the types defined in lib/types.ts so that the
// upsert route can stay clean.
// -------------------------------------------------------------------------

import type { League, Team, Player, Match, Odd, MatchStatus } from "@/lib/types"

// ---------------------------------------------------------------------------
// API-Football raw shapes (partial — only fields we consume)
// ---------------------------------------------------------------------------

interface AFFixture {
  fixture: {
    id: number
    status: { short: string; elapsed: number | null }
    date: string
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
  }
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  goals: { home: number | null; away: number | null }
  score: { halftime: { home: number | null; away: number | null } }
}

interface AFPlayer {
  player: {
    id: number
    name: string
    age: number
    photo: string
  }
  statistics: Array<{
    team: { id: number }
    games: { position: string; appearences: number; minutes: number }
    goals: { total: number | null; assists: number | null }
    shots: { total: number | null; on: number | null }
    passes: { total: number | null }
    tackles: { total: number | null }
    fouls: { committed: number | null }
    cards: { yellow: number | null; red: number | null }
  }>
}

// ---------------------------------------------------------------------------
// The Odds API raw shapes
// ---------------------------------------------------------------------------

interface OddsEvent {
  id: string
  sport_key: string
  home_team: string
  away_team: string
  bookmakers: Array<{
    key: string
    title: string
    markets: Array<{
      key: string
      outcomes: Array<{ name: string; price: number }>
    }>
  }>
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function afStatusToInternal(short: string): MatchStatus {
  if (["1H", "HT", "2H", "ET", "BT", "P", "LIVE"].includes(short)) return "live"
  if (["FT", "AET", "PEN"].includes(short)) return "finished"
  return "upcoming"
}

export function mapLeague(af: AFFixture["league"]): Omit<League, "id"> & { id: number } {
  return {
    id: af.id,
    name: af.name,
    country: af.country,
    logo_url: af.logo || null,
    season: af.season,
  }
}

export function mapTeam(
  t: AFFixture["teams"]["home"],
  leagueId: number,
): Omit<Team, "attack_rating" | "defense_rating" | "avg_goals_for" | "avg_goals_against" | "avg_corners" | "avg_cards" | "form"> & {
  id: number
  league_id: number
  logo_url: string | null
  short_name: string | null
} {
  return {
    id: t.id,
    name: t.name,
    short_name: t.name.slice(0, 3).toUpperCase(),
    league_id: leagueId,
    logo_url: t.logo || null,
  }
}

export function mapMatch(af: AFFixture): Omit<Match, "stats"> & { stats: object } {
  return {
    id: af.fixture.id,
    league_id: af.league.id,
    home_team_id: af.teams.home.id,
    away_team_id: af.teams.away.id,
    kickoff: af.fixture.date,
    status: afStatusToInternal(af.fixture.status.short),
    minute: af.fixture.status.elapsed ?? null,
    home_goals: af.goals.home,
    away_goals: af.goals.away,
    stats: {},
  }
}

export function mapPlayer(af: AFPlayer, season: number): (Omit<Player, "id"> & { id: number }) | null {
  const stats = af.statistics[0]
  if (!stats) return null

  const appearances = stats.games.appearences ?? 0
  const divisor = appearances > 0 ? appearances : 1

  return {
    id: af.player.id,
    name: af.player.name,
    team_id: stats.team.id,
    position: stats.games.position ?? null,
    photo_url: af.player.photo || null,
    age: af.player.age ?? null,
    appearances,
    goals: stats.goals.total ?? 0,
    assists: stats.goals.assists ?? 0,
    avg_shots: Math.round(((stats.shots.total ?? 0) / divisor) * 10) / 10,
    avg_shots_on_target: Math.round(((stats.shots.on ?? 0) / divisor) * 10) / 10,
    avg_passes: Math.round((stats.passes.total ?? 0) / divisor),
    avg_tackles: Math.round(((stats.tackles.total ?? 0) / divisor) * 10) / 10,
    avg_fouls: Math.round(((stats.fouls.committed ?? 0) / divisor) * 10) / 10,
    yellow_cards: stats.cards.yellow ?? 0,
    red_cards: stats.cards.red ?? 0,
  }
}

let _oddIdCounter = Date.now()

export function mapOdds(event: OddsEvent, matchId: number): Omit<Odd, "id">[] {
  const odds: Omit<Odd, "id">[] = []
  const now = new Date().toISOString()

  for (const bk of event.bookmakers) {
    for (const market of bk.markets) {
      for (const outcome of market.outcomes) {
        odds.push({
          match_id: matchId,
          bookmaker: bk.title,
          market: market.key,
          selection: outcome.name,
          price: outcome.price,
          fair_price: null,
          updated_at: now,
        })
      }
    }
  }
  return odds
}
