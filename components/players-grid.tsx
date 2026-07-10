"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Player, Team } from "@/lib/types"

type PlayerWithTeam = Player & { team?: Team }

const POSITION_LABELS: Record<string, string> = {
  Goalkeeper: "Portero",
  Defender: "Defensa",
  Midfielder: "Centrocampista",
  Forward: "Delantero",
}

function positionColor(position: string | null): string {
  switch (position) {
    case "Forward":
      return "bg-destructive/15 text-destructive border-destructive/30"
    case "Midfielder":
      return "bg-primary/15 text-primary border-primary/30"
    case "Defender":
      return "bg-chart-2/15 text-chart-2 border-chart-2/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold tabular-nums text-foreground">{value}</span>
    </span>
  )
}

function PlayerCard({ player }: { player: PlayerWithTeam }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-card/80"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <User className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight group-hover:text-primary">
            {player.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {player.team?.name ?? "Sin equipo"}
          </p>
        </div>
        {player.position ? (
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${positionColor(
              player.position,
            )}`}
          >
            {POSITION_LABELS[player.position] ?? player.position}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3">
        <StatPill label="Goles " value={player.goals} />
        <StatPill label="Asis. " value={player.assists} />
        <StatPill label="Tiros " value={player.avg_shots.toFixed(1)} />
        <StatPill label="S/Arco " value={player.avg_shots_on_target.toFixed(1)} />
        <StatPill label="Pases " value={player.avg_passes.toFixed(0)} />
      </div>
    </Link>
  )
}

export function PlayersGrid({ players }: { players: PlayerWithTeam[] }) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return players
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team?.name.toLowerCase().includes(q) ||
        (p.position ?? "").toLowerCase().includes(q),
    )
  }, [players, search])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar jugador o equipo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No se encontraron jugadores con esa búsqueda.
        </p>
      )}
    </div>
  )
}
