import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { apiFootball, theOdds } from "@/lib/providers"
import { mapLeague, mapMatch, mapOdds, mapTeam } from "@/lib/sync"
import { evaluateOpportunities } from "@/lib/engine"

// All active soccer leagues/tournaments to pull odds from.
// Add or remove keys as competitions start/end each season.
const ACTIVE_LEAGUES = [
  // 🌍 International Tournaments
  "soccer_fifa_world_cup",            // FIFA World Cup 2026 (en curso)
  "soccer_conmebol_copa_libertadores",// Copa Libertadores
  "soccer_conmebol_copa_sudamericana",// Copa Sudamericana
  "soccer_uefa_champs_league_qualification", // Clasificación Champions
  // 🇬🇧 England
  "soccer_epl",
  "soccer_efl_champ",
  // 🇪🇸 Spain
  "soccer_spain_la_liga",
  // 🇩🇪 Germany
  "soccer_germany_bundesliga",
  // 🇮🇹 Italy
  "soccer_italy_serie_a",
  // 🇫🇷 France
  "soccer_france_ligue_one",
  // 🇧🇷 Brazil
  "soccer_brazil_campeonato",
  "soccer_brazil_serie_b",
  // 🇦🇷 Argentina
  "soccer_argentina_primera_division",
  // 🇺🇸 USA
  "soccer_usa_mls",
  // 🇲🇽 Mexico
  "soccer_mexico_ligamx",
]

// Optional secret to prevent accidental public triggering.
// Set SYNC_SECRET in env vars. If absent, the route is open.
function authorized(req: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET
  if (!secret) return true
  const auth = req.headers.get("authorization") ?? ""
  return auth === `Bearer ${secret}`
}

interface SyncResult {
  fixtures: number
  teams: number
  leagues: number
  odds: number
  errors: string[]
  providers: {
    apiFootball: boolean
    theOdds: boolean
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10)
  const provider = searchParams.get("provider") ?? "all"

  const result: SyncResult = {
    fixtures: 0,
    teams: 0,
    leagues: 0,
    odds: 0,
    errors: [],
    providers: {
      apiFootball: apiFootball.configured,
      theOdds: theOdds.configured,
    },
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing Supabase URL or Service Role Key" }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  // -------------------------------------------------------------------------
  // API-Football: fixtures, teams, leagues
  // -------------------------------------------------------------------------
  if ((provider === "all" || provider === "api-football") && apiFootball.configured) {
    try {
      const raw = (await apiFootball.fixturesByDate(date)) as {
        response: Array<{
          fixture: { id: number; status: { short: string; elapsed: number | null }; date: string }
          league: { id: number; name: string; country: string; logo: string; season: number }
          teams: { home: { id: number; name: string; logo: string }; away: { id: number; name: string; logo: string } }
          goals: { home: number | null; away: number | null }
          score: { halftime: { home: number | null; away: number | null } }
        }>
      }

      const fixtures = raw.response ?? []

      // Upsert leagues
      const leagueRows = [...new Map(fixtures.map((f) => [f.league.id, mapLeague(f.league)])).values()]
      if (leagueRows.length > 0) {
        const { error } = await supabase.from("leagues").upsert(leagueRows, { onConflict: "id" })
        if (error) result.errors.push(`leagues: ${error.message}`)
        else result.leagues += leagueRows.length
      }

      // Upsert teams
      const teamSet = new Map<number, ReturnType<typeof mapTeam>>()
      for (const f of fixtures) {
        teamSet.set(f.teams.home.id, mapTeam(f.teams.home, f.league.id))
        teamSet.set(f.teams.away.id, mapTeam(f.teams.away, f.league.id))
      }
      const teamRows = [...teamSet.values()].map((t) => ({
        id: t.id,
        name: t.name,
        short_name: t.short_name,
        league_id: t.league_id,
        logo_url: t.logo_url,
      }))
      if (teamRows.length > 0) {
        const { error } = await supabase.from("teams").upsert(teamRows, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        if (error) result.errors.push(`teams: ${error.message}`)
        else result.teams += teamRows.length
      }

      // Upsert matches
      const matchRows = fixtures.map(mapMatch)
      if (matchRows.length > 0) {
        const { error } = await supabase.from("matches").upsert(matchRows, { onConflict: "id" })
        if (error) result.errors.push(`matches: ${error.message}`)
        else result.fixtures += matchRows.length
      }
    } catch (e) {
      result.errors.push(`API-Football: ${(e as Error).message}`)
    }
  }

  // -------------------------------------------------------------------------
  // The Odds API: market odds
  // -------------------------------------------------------------------------
  if ((provider === "all" || provider === "odds") && theOdds.configured) {
    try {
      const raw = (await theOdds.oddsMultiple(ACTIVE_LEAGUES)) as Array<{
        id: string
        sport_key: string
        home_team: string
        away_team: string
        bookmakers: Array<{
          key: string
          title: string
          markets: Array<{ key: string; outcomes: Array<{ name: string; price: number }> }>
        }>
      }>

      // Resolve event IDs to match IDs via team names (best-effort)
      const { data: matches } = await supabase
        .from("matches")
        .select("id, home_team_id, away_team_id")
        .in("status", ["upcoming", "live"])

      const { data: teams } = await supabase.from("teams").select("id, name")
      const teamByName = new Map<string, number>((teams ?? []).map((t) => [t.name.toLowerCase(), t.id]))

      for (const event of raw ?? []) {
        const homeId = teamByName.get(event.home_team.toLowerCase())
        const awayId = teamByName.get(event.away_team.toLowerCase())
        if (!homeId || !awayId) continue

        const match = (matches ?? []).find(
          (m) => m.home_team_id === homeId && m.away_team_id === awayId,
        )
        if (!match) continue

        const oddRows = mapOdds(event, match.id)
        if (oddRows.length === 0) continue

        const { error } = await supabase.from("odds").insert(oddRows)
        if (error) result.errors.push(`odds(match ${match.id}): ${error.message}`)
        else result.odds += oddRows.length
      }
    } catch (e) {
      result.errors.push(`The Odds API: ${(e as Error).message}`)
    }
  }

  // -------------------------------------------------------------------------
  // Evaluation Engine: Generate opportunities from matches and odds
  // -------------------------------------------------------------------------
  let evaluationResult = null
  if (result.errors.length === 0 || apiFootball.configured) {
    evaluationResult = await evaluateOpportunities()
    if (evaluationResult.errors.length > 0) {
      result.errors.push(...evaluationResult.errors)
    }
  }

  const status =
    !apiFootball.configured && !theOdds.configured
      ? 200 // nothing configured — valid state, not an error
      : result.errors.length > 0
      ? 207 // partial success
      : 200

  return NextResponse.json({ ...result, evaluation: evaluationResult }, { status })
}
