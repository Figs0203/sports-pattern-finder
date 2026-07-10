import Link from "next/link"
import { ScoreBadge, EdgeTag } from "@/components/score-badge"
import { TeamCrest } from "@/components/team-crest"
import { categoryLabel } from "@/lib/labels"
import type { OpportunityWithMatch } from "@/lib/types"

export function OpportunityCard({ opp }: { opp: OpportunityWithMatch }) {
  const { match } = opp
  return (
    <Link
      href={`/matches/${match.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {categoryLabel(opp.category)}
          </span>
          <p className="mt-0.5 text-pretty font-semibold leading-tight">{opp.label}</p>
        </div>
        <ScoreBadge score={opp.score} />
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <TeamCrest team={match.home_team} size="sm" />
        <span className="truncate">{match.home_team.short_name}</span>
        <span className="text-xs">vs</span>
        <TeamCrest team={match.away_team} size="sm" />
        <span className="truncate">{match.away_team.short_name}</span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <EdgeTag edge={opp.edge} />
        <div className="text-right">
          <span className="font-mono text-sm font-semibold tabular-nums">
            {opp.bookmaker_price.toFixed(2)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">cuota</span>
        </div>
      </div>
    </Link>
  )
}
