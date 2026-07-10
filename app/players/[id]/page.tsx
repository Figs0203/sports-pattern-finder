import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Target, Crosshair, Trophy, Handshake } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PlayerStreakCard } from "@/components/player-streak-card"
import { PlayerMatchTable } from "@/components/player-match-table"
import { ScoreBadge } from "@/components/score-badge"
import { getPlayer, getOpportunitiesForMatch, getMatches } from "@/lib/data"
import { buildPlayerHistory, computeStreaks } from "@/lib/player-history"
import { categoryLabel } from "@/lib/labels"
import type { Opportunity } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const player = await getPlayer(Number(id))
  return {
    title: player ? `${player.name} — GolValue` : "Jugador — GolValue",
  }
}

// Collect all stored player opportunities by scanning upcoming matches
async function getPlayerOpportunities(playerId: number): Promise<Opportunity[]> {
  const matches = await getMatches()
  const allOpps: Opportunity[] = []
  await Promise.all(
    matches.slice(0, 20).map(async (m) => {
      const opps = await getOpportunitiesForMatch(m.id)
      allOpps.push(...opps.filter((o) => o.player_id === playerId))
    }),
  )
  return allOpps.sort((a, b) => b.score - a.score)
}

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="font-mono text-2xl font-bold tabular-nums">{value}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

const POSITION_LABELS: Record<string, string> = {
  Goalkeeper: "Portero",
  Defender: "Defensa",
  Midfielder: "Centrocampista",
  Forward: "Delantero",
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const playerId = Number(id)
  const [player, opps] = await Promise.all([
    getPlayer(playerId),
    getPlayerOpportunities(playerId),
  ])
  if (!player) notFound()

  const history = buildPlayerHistory(player, 13)
  const streaks = computeStreaks(history)

  const topStreaks = streaks.slice(0, 4)

  return (
    <>
      <PageHeader
        title={player.name}
        description={[
          player.team?.name,
          player.position ? POSITION_LABELS[player.position] ?? player.position : null,
          player.age ? `${player.age} años` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      >
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver
        </Link>
      </PageHeader>

      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Season stats */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <User className="size-4" /> Estadísticas de temporada
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatBlock icon={Trophy} label="Goles" value={player.goals} sub={`${player.appearances} partidos`} />
            <StatBlock icon={Handshake} label="Asistencias" value={player.assists} />
            <StatBlock
              icon={Target}
              label="Tiros/partido"
              value={player.avg_shots.toFixed(1)}
              sub="promedio"
            />
            <StatBlock
              icon={Crosshair}
              label="S/Arco"
              value={player.avg_shots_on_target.toFixed(1)}
              sub="promedio"
            />
            <StatBlock
              icon={User}
              label="Pases/partido"
              value={player.avg_passes.toFixed(0)}
              sub="promedio"
            />
            <StatBlock
              icon={User}
              label="Tarjetas"
              value={`${player.yellow_cards}A / ${player.red_cards}R`}
            />
          </div>
        </section>

        {/* Streaks */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Patrones detectados · últimos {history.length} partidos
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topStreaks.map((s) => (
              <PlayerStreakCard key={s.label} streak={s} />
            ))}
          </div>
        </section>

        {/* Stored opportunities */}
        {opps.length > 0 ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Señales del modelo
            </h2>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {opps.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-primary">
                      {categoryLabel(o.category)}
                    </span>
                    <p className="font-semibold leading-snug">{o.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Cuota {o.bookmaker_price.toFixed(2)} · Prob. modelo{" "}
                      {(o.model_prob * 100).toFixed(0)}% · Edge +{o.edge.toFixed(1)}%
                    </p>
                  </div>
                  <ScoreBadge score={o.score} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Match history table */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Historial de últimos {history.length} partidos
          </h2>
          <PlayerMatchTable logs={history} />
        </section>
      </div>
    </>
  )
}
