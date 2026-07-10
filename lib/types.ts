// Core domain types shared across the app.
// These map 1:1 to the Supabase tables and are also the shape that any
// real-data provider (API-Football / The Odds API) must produce.

export type MatchStatus = "upcoming" | "live" | "finished"

export interface League {
  id: number
  name: string
  country: string
  logo_url: string | null
  season: number
}

export interface Team {
  id: number
  name: string
  short_name: string | null
  league_id: number | null
  logo_url: string | null
  attack_rating: number
  defense_rating: number
  avg_goals_for: number
  avg_goals_against: number
  avg_corners: number
  avg_cards: number
  form: string
}

export interface Player {
  id: number
  name: string
  team_id: number | null
  position: string | null
  photo_url: string | null
  age: number | null
  appearances: number
  goals: number
  assists: number
  avg_shots: number
  avg_shots_on_target: number
  avg_passes: number
  avg_tackles: number
  avg_fouls: number
  yellow_cards: number
  red_cards: number
}

export interface MatchStatsSide {
  home: number
  away: number
}

export interface MatchStats {
  corners?: MatchStatsSide
  cards?: MatchStatsSide
  shots?: MatchStatsSide
}

export interface Match {
  id: number
  league_id: number | null
  home_team_id: number
  away_team_id: number
  kickoff: string
  status: MatchStatus
  minute: number | null
  home_goals: number | null
  away_goals: number | null
  stats: MatchStats
}

// Match enriched with its teams and league for display.
export interface MatchWithTeams extends Match {
  home_team: Team
  away_team: Team
  league: League | null
}

export interface Odd {
  id: number
  match_id: number
  bookmaker: string
  market: string
  selection: string
  price: number
  fair_price: number | null
  updated_at: string
}

export type OpportunityCategory =
  | "goals"
  | "corners"
  | "cards"
  | "shots"
  | "btts"
  | "result"
  | "player_shots"

export interface Opportunity {
  id: number
  match_id: number
  player_id: number | null
  category: OpportunityCategory | string
  market: string
  selection: string
  label: string
  score: number
  edge: number
  model_prob: number
  bookmaker_price: number
  reasoning: string | null
  created_at: string
}

export interface OpportunityWithMatch extends Opportunity {
  match: MatchWithTeams
  player?: Player | null
}

export interface Strategy {
  id: number
  name: string
  description: string | null
  category: string
  min_score: number
  min_edge: number
  stake: number
  created_at: string
}

export interface BacktestBet {
  id: number
  strategy_id: number
  match_id: number | null
  label: string
  price: number
  stake: number
  score: number
  edge: number
  won: boolean
  profit: number
  settled_at: string
}
