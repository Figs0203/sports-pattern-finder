import { createClient } from "@/lib/supabase/server"
import type {
  BacktestBet,
  League,
  Match,
  MatchWithTeams,
  Odd,
  Opportunity,
  OpportunityWithMatch,
  Player,
  Strategy,
  Team,
} from "@/lib/types"

// Central read layer. Every page reads through these helpers so that the
// underlying source (currently Supabase, fed by the ingestion layer) can be
// swapped or extended without touching the UI.

function joinMatch(
  match: Match,
  teams: Map<number, Team>,
  leagues: Map<number, League>,
): MatchWithTeams {
  return {
    ...match,
    home_team: teams.get(match.home_team_id)!,
    away_team: teams.get(match.away_team_id)!,
    league: match.league_id ? leagues.get(match.league_id) ?? null : null,
  }
}

async function loadLookups() {
  const supabase = await createClient()
  const [{ data: teams }, { data: leagues }] = await Promise.all([
    supabase.from("teams").select("*"),
    supabase.from("leagues").select("*"),
  ])
  const teamMap = new Map<number, Team>((teams ?? []).map((t) => [t.id, t as Team]))
  const leagueMap = new Map<number, League>((leagues ?? []).map((l) => [l.id, l as League]))
  return { teamMap, leagueMap }
}

export async function getLeagues(): Promise<League[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("leagues").select("*").order("name")
  return (data ?? []) as League[]
}

export async function getMatches(filter?: {
  status?: string
  leagueId?: number
}): Promise<MatchWithTeams[]> {
  const supabase = await createClient()
  let query = supabase.from("matches").select("*").order("kickoff", { ascending: true })
  if (filter?.status) query = query.eq("status", filter.status)
  if (filter?.leagueId) query = query.eq("league_id", filter.leagueId)

  const [{ data: matches }, lookups] = await Promise.all([query, loadLookups()])
  return (matches ?? []).map((m) => joinMatch(m as Match, lookups.teamMap, lookups.leagueMap))
}

export async function getMatch(id: number): Promise<MatchWithTeams | null> {
  const supabase = await createClient()
  const [{ data: match }, lookups] = await Promise.all([
    supabase.from("matches").select("*").eq("id", id).maybeSingle(),
    loadLookups(),
  ])
  if (!match) return null
  return joinMatch(match as Match, lookups.teamMap, lookups.leagueMap)
}

export async function getOddsForMatch(matchId: number): Promise<Odd[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("odds").select("*").eq("match_id", matchId)
  return (data ?? []) as Odd[]
}

export async function getOpportunitiesForMatch(matchId: number): Promise<Opportunity[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .eq("match_id", matchId)
    .order("score", { ascending: false })
  return (data ?? []) as Opportunity[]
}

export async function getTopOpportunities(limit = 12): Promise<OpportunityWithMatch[]> {
  const supabase = await createClient()
  const { data: opps } = await supabase
    .from("opportunities")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit)

  if (!opps || opps.length === 0) return []

  const lookups = await loadLookups()
  const matchIds = [...new Set(opps.map((o) => o.match_id))]
  const playerIds = [...new Set(opps.map((o) => o.player_id).filter(Boolean))] as number[]

  const [{ data: matches }, { data: players }] = await Promise.all([
    supabase.from("matches").select("*").in("id", matchIds),
    playerIds.length
      ? supabase.from("players").select("*").in("id", playerIds)
      : Promise.resolve({ data: [] as Player[] }),
  ])

  const matchMap = new Map<number, Match>((matches ?? []).map((m) => [m.id, m as Match]))
  const playerMap = new Map<number, Player>((players ?? []).map((p) => [p.id, p as Player]))

  return (opps as Opportunity[])
    .filter((o) => matchMap.has(o.match_id))
    .map((o) => ({
      ...o,
      match: joinMatch(matchMap.get(o.match_id)!, lookups.teamMap, lookups.leagueMap),
      player: o.player_id ? playerMap.get(o.player_id) ?? null : null,
    }))
}

export async function getPlayers(search?: string): Promise<(Player & { team?: Team })[]> {
  const supabase = await createClient()
  let query = supabase.from("players").select("*").order("goals", { ascending: false })
  if (search) query = query.ilike("name", `%${search}%`)
  const [{ data: players }, lookups] = await Promise.all([query, loadLookups()])
  return (players ?? []).map((p) => ({
    ...(p as Player),
    team: p.team_id ? lookups.teamMap.get(p.team_id) : undefined,
  }))
}

export async function getPlayer(id: number): Promise<(Player & { team?: Team }) | null> {
  const supabase = await createClient()
  const { data: player } = await supabase.from("players").select("*").eq("id", id).maybeSingle()
  if (!player) return null
  const lookups = await loadLookups()
  return {
    ...(player as Player),
    team: player.team_id ? lookups.teamMap.get(player.team_id) : undefined,
  }
}

export async function getTeam(id: number): Promise<Team | null> {
  const supabase = await createClient()
  const { data } = await supabase.from("teams").select("*").eq("id", id).maybeSingle()
  return (data as Team) ?? null
}

export async function getStrategies(): Promise<Strategy[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("strategies").select("*").order("id")
  return (data ?? []) as Strategy[]
}

export async function getBacktestBets(strategyId?: number): Promise<BacktestBet[]> {
  const supabase = await createClient()
  let query = supabase.from("backtest_bets").select("*").order("settled_at", { ascending: true })
  if (strategyId) query = query.eq("strategy_id", strategyId)
  const { data } = await query
  return (data ?? []) as BacktestBet[]
}

export async function getOpportunities(limit = 500): Promise<Opportunity[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  return (data ?? []) as Opportunity[]
}

