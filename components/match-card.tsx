import Link from "next/link"
import { ChevronRight, Radio } from "lucide-react"
import { TeamCrest } from "@/components/team-crest"
import { ScoreBadge } from "@/components/score-badge"
import { formatKickoff } from "@/lib/format"
import type { MatchWithTeams } from "@/lib/types"
import { cn } from "@/lib/utils"

export function MatchCard({
  match,
  topScore,
  oppCount,
}: {
  match: MatchWithTeams
  topScore?: number
  oppCount?: number
}) {
  const live = match.status === "live"
  const finished = match.status === "finished"

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{match.league?.name ?? "—"}</span>
        {live ? (
          <span className="flex items-center gap-1 font-medium text-destructive">
            <Radio className="size-3 animate-pulse" /> {match.minute}&apos;
          </span>
        ) : finished ? (
          <span>Finalizado</span>
        ) : (
          <span>{formatKickoff(match.kickoff)}</span>
        )}
      </div>

      <div className="space-y-2">
        <TeamRow
          team={match.home_team}
          goals={match.home_goals}
          showGoals={live || finished}
        />
        <TeamRow
          team={match.away_team}
          goals={match.away_goals}
          showGoals={live || finished}
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          {oppCount ? `${oppCount} oportunidad${oppCount > 1 ? "es" : ""}` : "Sin señales"}
        </span>
        <div className="flex items-center gap-2">
          {typeof topScore === "number" && topScore > 0 ? <ScoreBadge score={topScore} /> : null}
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

function TeamRow({
  team,
  goals,
  showGoals,
}: {
  team: MatchWithTeams["home_team"]
  goals: number | null
  showGoals: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <TeamCrest team={team} size="sm" />
        <span className="truncate text-sm font-medium">{team.name}</span>
      </div>
      {showGoals ? (
        <span className={cn("font-mono text-sm font-semibold tabular-nums")}>{goals ?? 0}</span>
      ) : null}
    </div>
  )
}
