import { PageHeader } from "@/components/page-header"
import { MatchesBrowser } from "@/components/matches-browser"
import { getLeagues, getMatches, getTopOpportunities } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function MatchesPage() {
  const [matches, leagues, opps] = await Promise.all([
    getMatches(),
    getLeagues(),
    getTopOpportunities(100),
  ])

  const oppByMatch: Record<number, { count: number; top: number }> = {}
  for (const o of opps) {
    const cur = oppByMatch[o.match_id] ?? { count: 0, top: 0 }
    oppByMatch[o.match_id] = { count: cur.count + 1, top: Math.max(cur.top, o.score) }
  }

  return (
    <>
      <PageHeader
        title="Partidos"
        description="Explora todos los encuentros y filtra por liga o estado."
      />
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <MatchesBrowser matches={matches} leagues={leagues} oppByMatch={oppByMatch} />
      </div>
    </>
  )
}
