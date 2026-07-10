// -------------------------------------------------------------------------
// Real-data provider layer.
//
// The app currently reads from Supabase (see lib/data.ts). These providers
// are the ingestion side: once the API keys are set, the /api/sync route
// pulls fixtures, players and odds from the real services and upserts them
// into Supabase, which the whole UI already reads from.
//
// Nothing here runs until the corresponding env var is present, so the app
// works today with seed data and "just works" the moment keys are added.
// -------------------------------------------------------------------------

export interface ProviderStatus {
  id: string
  name: string
  envVar: string
  configured: boolean
  description: string
}

export function getProviderStatus(): ProviderStatus[] {
  return [
    {
      id: "api-football",
      name: "API-Football",
      envVar: "API_FOOTBALL_KEY",
      configured: Boolean(process.env.API_FOOTBALL_KEY),
      description: "Fixtures, equipos, jugadores y estadísticas en vivo.",
    },
    {
      id: "the-odds-api",
      name: "The Odds API",
      envVar: "THE_ODDS_API_KEY",
      configured: Boolean(process.env.THE_ODDS_API_KEY),
      description: "Cuotas de mercado de múltiples casas de apuestas.",
    },
  ]
}

const API_FOOTBALL_BASE = "https://v3.football.api-sports.io"
const THE_ODDS_BASE = "https://api.the-odds-api.com/v4"

class MissingKeyError extends Error {
  constructor(envVar: string) {
    super(`Falta la variable de entorno ${envVar}. Añádela para activar la ingesta real.`)
    this.name = "MissingKeyError"
  }
}

// --- API-Football -------------------------------------------------------

export const apiFootball = {
  get configured() {
    return Boolean(process.env.API_FOOTBALL_KEY)
  },

  async request<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const key = process.env.API_FOOTBALL_KEY
    if (!key) throw new MissingKeyError("API_FOOTBALL_KEY")

    const url = new URL(`${API_FOOTBALL_BASE}${path}`)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

    const res = await fetch(url, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`API-Football ${res.status}: ${await res.text()}`)
    return res.json() as Promise<T>
  },

  fixturesByDate(date: string, league?: number) {
    return this.request<unknown>("/fixtures", { date, ...(league ? { league } : {}) })
  },

  players(team: number, season: number) {
    return this.request<unknown>("/players", { team, season })
  },

  statistics(fixture: number) {
    return this.request<unknown>("/fixtures/statistics", { fixture })
  },
}

// --- The Odds API -------------------------------------------------------

export const theOdds = {
  get configured() {
    return Boolean(process.env.THE_ODDS_API_KEY)
  },

  async request<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const key = process.env.THE_ODDS_API_KEY
    if (!key) throw new MissingKeyError("THE_ODDS_API_KEY")

    const url = new URL(`${THE_ODDS_BASE}${path}`)
    url.searchParams.set("apiKey", key)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

    const res = await fetch(url, { next: { revalidate: 120 } })
    if (!res.ok) throw new Error(`The Odds API ${res.status}: ${await res.text()}`)
    return res.json() as Promise<T>
  },

  odds(sportKey: string, markets = "h2h,totals") {
    return this.request<unknown>(`/sports/${sportKey}/odds`, {
      regions: "eu",
      markets,
      oddsFormat: "decimal",
    })
  },

  // Fetch odds for multiple leagues and merge results
  async oddsMultiple(sportKeys: string[], markets = "h2h,totals"): Promise<unknown[]> {
    const results: unknown[] = []
    for (const key of sportKeys) {
      try {
        const data = await this.odds(key, markets) as unknown[]
        if (Array.isArray(data)) results.push(...data)
      } catch {
        // Skip unavailable leagues silently
      }
    }
    return results
  },
}
