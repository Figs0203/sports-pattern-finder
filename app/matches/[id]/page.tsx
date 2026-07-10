import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Radio } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { TeamCrest } from "@/components/team-crest"
import { FormBadge } from "@/components/form-badge"
import { MatchSuggestions } from "@/components/match-suggestions"
import { MatchModelPanel } from "@/components/match-model-panel"
import { getMatch, getOddsForMatch, getOpportunitiesForMatch } from "@/lib/data"
import {
  bttsProb,
  cardsModel,
  cornersModel,
  expectedGoals,
  overGoalsProb,
  resultProbs,
} from "@/lib/scoring"
import { formatKickoff } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const matchId = Number(id)
  const match = await getMatch(matchId)
  if (!match) notFound()

  const [odds, opportunities] = await Promise.all([
    getOddsForMatch(matchId),
    getOpportunitiesForMatch(matchId),
  ])

  const xg = expectedGoals(match)
  const model = {
    xg,
    over25: overGoalsProb(match, 2.5),
    over15: overGoalsProb(match, 1.5),
    over35: overGoalsProb(match, 3.5),
    btts: bttsProb(match),
    result: resultProbs(match),
    corners: cornersModel(match, 9.5),
    cards: cardsModel(match, 4.5),
  }

  const live = match.status === "live"
  const finished = match.status === "finished"

  return (
    <>
      <PageHeader title="Análisis de partido" description={match.league?.name ?? undefined}>
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver
        </Link>
      </PageHeader>

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Scoreboard */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {live ? (
              <span className="flex items-center gap-1 font-medium text-destructive">
                <Radio className="size-3 animate-pulse" /> En directo · {match.minute}&apos;
              </span>
            ) : finished ? (
              <span>Finalizado</span>
            ) : (
              <span>{formatKickoff(match.kickoff)}</span>
            )}
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <TeamColumn team={match.home_team} align="end" />
            <div className="text-center">
              {live || finished ? (
                <div className="font-mono text-4xl font-bold tabular-nums">
                  {match.home_goals ?? 0}
                  <span className="mx-2 text-muted-foreground">-</span>
                  {match.away_goals ?? 0}
                </div>
              ) : (
                <div className="text-2xl font-semibold text-muted-foreground">vs</div>
              )}
            </div>
            <TeamColumn team={match.away_team} align="start" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <MatchSuggestions opportunities={opportunities} odds={odds} />
          </div>
          <div className="lg:col-span-2">
            <MatchModelPanel match={match} model={model} />
          </div>
        </div>
      </div>
    </>
  )
}

function TeamColumn({
  team,
  align,
}: {
  team: import("@/lib/types").Team
  align: "start" | "end"
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${align === "end" ? "sm:items-end" : "sm:items-start"}`}
    >
      <TeamCrest team={team} size="lg" />
      <p className="text-center text-sm font-semibold sm:text-base">{team.name}</p>
      <FormBadge form={team.form} />
    </div>
  )
}
