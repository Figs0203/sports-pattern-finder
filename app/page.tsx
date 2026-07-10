import Link from "next/link"
import { Radio, Sparkles, Target, TrendingUp, Trophy } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { MatchCard } from "@/components/match-card"
import { OpportunityCard } from "@/components/opportunity-card"
import { StatCard } from "@/components/stat-card"
import { ProviderStatusBanner } from "@/components/provider-status-banner"
import { PatternCard } from "@/components/pattern-card"
import { SyncButton } from "@/components/sync-button"
import { getMatches, getTopOpportunities, getOpportunities } from "@/lib/data"
import { getProviderStatus } from "@/lib/providers"
import { discoverPatterns } from "@/lib/patterns"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [live, upcoming, opportunities, allOpps] = await Promise.all([
    getMatches({ status: "live" }),
    getMatches({ status: "upcoming" }),
    getTopOpportunities(9),
    getOpportunities(300),
  ])

  const providers = getProviderStatus()
  const hasLiveData = providers.some((p) => p.configured)

  // Precompute per-match opportunity summaries.
  const oppByMatch = new Map<number, { count: number; top: number }>()
  for (const o of opportunities) {
    const cur = oppByMatch.get(o.match_id) ?? { count: 0, top: 0 }
    oppByMatch.set(o.match_id, { count: cur.count + 1, top: Math.max(cur.top, o.score) })
  }

  const avgScore =
    opportunities.length > 0
      ? Math.round(opportunities.reduce((s, o) => s + o.score, 0) / opportunities.length)
      : 0
  const bestEdge =
    opportunities.length > 0 ? Math.max(...opportunities.map((o) => o.edge)) : 0

  // Top 3 patterns for the dashboard preview
  const topPatterns = discoverPatterns(allOpps).slice(0, 3)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen de partidos, valor detectado y señales del modelo."
      >
        {hasLiveData && (
          <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Datos en vivo activos
          </div>
        )}
        <SyncButton />
      </PageHeader>

      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <ProviderStatusBanner providers={providers} />

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={Radio} label="En vivo" value={live.length} tone="destructive" />
          <StatCard icon={Trophy} label="Próximos" value={upcoming.length} />
          <StatCard icon={Target} label="Oportunidades" value={opportunities.length} />
          <StatCard
            icon={TrendingUp}
            label="Mejor edge"
            value={`+${bestEdge.toFixed(1)}%`}
            tone="primary"
          />
        </section>

        {live.length > 0 ? (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Radio className="size-4 text-destructive" /> En directo
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((m) => {
                const s = oppByMatch.get(m.id)
                return <MatchCard key={m.id} match={m} topScore={s?.top} oppCount={s?.count} />
              })}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Target className="size-4 text-primary" /> Mejores oportunidades
            </h2>
            <span className="text-xs text-muted-foreground">Score medio {avgScore}</span>
          </div>
          {opportunities.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((o) => (
                <OpportunityCard key={o.id} opp={o} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No hay oportunidades detectadas todavía.
            </p>
          )}
        </section>

        {topPatterns.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-4 text-primary" /> Patrones destacados
              </h2>
              <Link
                href="/patterns"
                className="text-xs text-primary hover:underline"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topPatterns.map((p) => (
                <PatternCard key={p.id} pattern={p} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Trophy className="size-4" /> Próximos partidos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 6).map((m) => {
              const s = oppByMatch.get(m.id)
              return <MatchCard key={m.id} match={m} topScore={s?.top} oppCount={s?.count} />
            })}
          </div>
        </section>
      </div>
    </>
  )
}
