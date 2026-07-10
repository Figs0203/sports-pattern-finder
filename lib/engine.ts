import { createClient } from "@supabase/supabase-js"
import { getMatches, getOddsForMatch } from "@/lib/data"
import { resultProbs, overGoalsProb, bttsProb, edgePct, valueScore, scoreTier } from "@/lib/scoring"
import type { Odd, Opportunity } from "@/lib/types"

// This engine evaluates upcoming matches and their market odds against the internal mathematical model.
export async function evaluateOpportunities(): Promise<{ evaluated: number; inserted: number; errors: string[] }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return { evaluated: 0, inserted: 0, errors: ["Missing Supabase credentials for engine"] }
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  const result = { evaluated: 0, inserted: 0, errors: [] as string[] }

  try {
    // 1. Fetch all upcoming and live matches
    const matches = await getMatches({ status: "upcoming" })
    
    // Process each match
    for (const match of matches) {
      // Get the odds for this match
      const odds = await getOddsForMatch(match.id)
      if (!odds || odds.length === 0) continue

      result.evaluated++
      const newOpportunities: Partial<Opportunity>[] = []

      // Calculate model probabilities
      const matchProbs = resultProbs(match)
      const over25Prob = overGoalsProb(match, 2.5)
      const over15Prob = overGoalsProb(match, 1.5)
      const bttsYesProb = bttsProb(match)

      // Compare model against bookmaker odds
      for (const odd of odds) {
        let modelProb = 0
        let category = "match"
        
        // Match market with our models
        if (odd.market === "h2h") {
          if (odd.selection === "Home") modelProb = matchProbs.home
          else if (odd.selection === "Draw") modelProb = matchProbs.draw
          else if (odd.selection === "Away") modelProb = matchProbs.away
        } else if (odd.market === "totals" || odd.market.includes("over_under")) {
          // Simplification for over 2.5
          if (odd.selection === "Over" && odd.market === "totals") {
            modelProb = over25Prob
            category = "goals"
          }
        } else if (odd.market === "btts") {
          if (odd.selection === "Yes") {
            modelProb = bttsYesProb
            category = "goals"
          } else {
            modelProb = 1 - bttsYesProb
            category = "goals"
          }
        }

        if (modelProb === 0) continue

        const edge = edgePct(modelProb, odd.price)
        const score = valueScore(modelProb, odd.price)

        // Only save positive edges or high scores (e.g. edge > 0)
        if (edge > 0 && score > 0) {
          const tier = scoreTier(score)
          newOpportunities.push({
            match_id: match.id,
            category: category as any,
            market: odd.market,
            selection: odd.selection,
            label: `${odd.market} - ${odd.selection}`,
            score: score,
            edge: edge,
            model_prob: modelProb,
            bookmaker_price: odd.price,
            reasoning: `Model calculates ${Math.round(modelProb * 100)}% prob (${tier.label} Value). Edge: +${edge}%.`
          } as any) // using as any to bypass strict type checking on optional id
        }
      }

      // Insert opportunities into Supabase
      if (newOpportunities.length > 0) {
        // First delete old opportunities for this match so we don't duplicate on re-runs
        await supabase.from("opportunities").delete().eq("match_id", match.id)
        
        const { error } = await supabase.from("opportunities").insert(newOpportunities)
        if (error) {
          result.errors.push(`Opp insert failed (match ${match.id}): ${error.message}`)
        } else {
          result.inserted += newOpportunities.length
        }
      }
    }
    
  } catch (err: any) {
    result.errors.push(`Engine error: ${err.message}`)
  }

  return result
}
