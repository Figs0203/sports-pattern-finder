# Sports Pattern Finder

A statistical sports betting analysis tool that identifies **value betting opportunities** by comparing mathematical probability models against bookmaker odds — with no AI or LLM involved, only pure statistics.

Built with **Next.js 15**, **Supabase**, and data from **API-Football** and **The Odds API**.

---

## Features

- **Dashboard** — Live and upcoming matches with detected opportunities and top patterns at a glance.
- **Pattern Discovery** — Statistically significant patterns detected from historical opportunity data (z-score based, no AI).
- **Opportunity Engine** — Evaluates Poisson/Expected Goals models vs bookmaker implied probabilities to find positive-edge bets.
- **Backtesting** — Simulate strategies against historical data and visualize the equity curve.
- **Player Analysis** — Player statistics, streaks and per-match performance tables.
- **Multi-league sync** — Pulls data from 13+ competitions including the FIFA World Cup 2026, MLS, Copa Libertadores, all major European leagues and more.
- **Auto-sync** — One-click sync button in the UI + optional Vercel cron job for fully automated updates.

---

## Architecture

```
API-Football ──┐
               ├──► /api/sync ──► Evaluation Engine ──► Supabase
The Odds API ──┘   (ingestion)    (lib/engine.ts)      (database)
                                                            │
                                                            ▼
                                                  Next.js UI (read-only)
                                          Dashboard / Matches / Patterns / Backtesting
```

**Key files:**

| File | Purpose |
|---|---|
| `app/api/sync/route.ts` | Data ingestion endpoint |
| `lib/providers.ts` | HTTP clients for external APIs |
| `lib/engine.ts` | Scoring engine — generates opportunities |
| `lib/scoring.ts` | Poisson model, Expected Goals, Value Score |
| `lib/patterns.ts` | Statistical pattern discovery (z-score) |
| `lib/data.ts` | All Supabase queries (read layer) |
| `supabase/schema.sql` | Database schema |
| `supabase/rls_policies.sql` | Row Level Security policies |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project
- A free [API-Football](https://api-sports.io) account (100 req/day)
- A free [The Odds API](https://the-odds-api.com) account (500 req/month)

### 1. Clone & install

```bash
git clone https://github.com/Figs0203/sports-pattern-finder.git
cd sports-pattern-finder
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
API_FOOTBALL_KEY=your-key
THE_ODDS_API_KEY=your-key
```

### 3. Initialize the database

In your Supabase project, open the **SQL Editor** and run these scripts in order:

```
supabase/schema.sql        <- Creates all tables
supabase/permissions.sql   <- Grants anon/service_role access
supabase/rls_policies.sql  <- Row Level Security read policies
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Sync data

Click the **"Actualizar datos"** button in the sidebar or dashboard, or visit:

```
http://localhost:3000/api/sync?provider=all
```

This will fetch fixtures and odds from all configured leagues and run the evaluation engine to detect opportunities.

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Figs0203/sports-pattern-finder)

1. Click the button above or run `vercel --prod`.
2. Add all environment variables in **Vercel → Settings → Environment Variables**.
3. The included `vercel.json` configures an automatic cron job that syncs data **every 3 hours** — no manual updates needed.

---

## Supported Leagues (The Odds API)

| Competition | Status |
|---|---|
| FIFA World Cup 2026 | Active |
| Copa Libertadores | Active |
| Copa Sudamericana | Active |
| Brasileirao Serie A & B | Active |
| Liga Argentina | Active |
| MLS | Active |
| Liga MX | Active |
| EPL / Championship | Seasonal (Aug-Jun) |
| La Liga | Seasonal (Aug-Jun) |
| Bundesliga | Seasonal (Aug-Jun) |
| Serie A | Seasonal (Aug-Jun) |
| Ligue 1 | Seasonal (Aug-Jun) |
| UEFA CL Qualification | Seasonal |

To add or remove leagues, edit the `ACTIVE_LEAGUES` array in `app/api/sync/route.ts`.

---

## Security Notes

- **Never commit `.env.local`** — it is excluded by `.gitignore`.
- The `/api/sync` endpoint is open by default. To protect it, add a `SYNC_SECRET` env variable and pass `Authorization: Bearer <secret>` in the request header.
- The Supabase `anon` key only has SELECT access (enforced by RLS policies). Write operations require `SUPABASE_SERVICE_ROLE_KEY`, which is only used server-side.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Stats data:** API-Football (v3)
- **Odds data:** The Odds API (v4)
- **Deployment:** Vercel

---

## License

MIT
