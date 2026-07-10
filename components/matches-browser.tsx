"use client"

import { useMemo, useState } from "react"
import { MatchCard } from "@/components/match-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { League, MatchWithTeams } from "@/lib/types"

const STATUS_TABS = [
  { key: "all", label: "Todos" },
  { key: "live", label: "En vivo" },
  { key: "upcoming", label: "Próximos" },
  { key: "finished", label: "Finalizados" },
] as const

export function MatchesBrowser({
  matches,
  leagues,
  oppByMatch,
}: {
  matches: MatchWithTeams[]
  leagues: League[]
  oppByMatch: Record<number, { count: number; top: number }>
}) {
  const [status, setStatus] = useState<string>("all")
  const [league, setLeague] = useState<string>("all")
  const [minScore, setMinScore] = useState<string>("all")

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (status !== "all" && m.status !== status) return false
      if (league !== "all" && String(m.league_id) !== league) return false
      
      const s = oppByMatch[m.id]
      if (minScore !== "all") {
        const min = Number(minScore)
        if (!s || s.top < min) return false
      }
      
      return true
    })
  }, [matches, status, league, oppByMatch, minScore])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                status === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={league} onValueChange={setLeague}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Liga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ligas</SelectItem>
              {leagues.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={minScore} onValueChange={setMinScore}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Oportunidad mín." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier score</SelectItem>
              <SelectItem value="60">Score +60</SelectItem>
              <SelectItem value="70">Score +70</SelectItem>
              <SelectItem value="80">Score +80</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const s = oppByMatch[m.id]
            return <MatchCard key={m.id} match={m} topScore={s?.top} oppCount={s?.count} />
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hay partidos que coincidan con los filtros.
        </p>
      )}
    </div>
  )
}
