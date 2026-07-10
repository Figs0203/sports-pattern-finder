import { Sparkles } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PatternsBrowser } from "@/components/patterns-browser"
import { getOpportunities } from "@/lib/data"
import { discoverPatterns } from "@/lib/patterns"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Patrones — GolValue",
  description: "Descubrimiento automático de patrones estadísticos con significancia verificada. Sin IA generativa.",
}

export default async function PatternsPage() {
  const opps = await getOpportunities(500)
  const patterns = discoverPatterns(opps)

  const highCount = patterns.filter((p) => p.significance === "high").length
  const totalSamples = patterns.reduce((s, p) => s + p.total, 0)

  return (
    <>
      <PageHeader
        title="Patrones estadísticos"
        description={`${patterns.length} patrones detectados · ${highCount} de alta confianza · ${totalSamples} muestras totales`}
      >
        <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          Basado en z-score estadístico
        </div>
      </PageHeader>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <PatternsBrowser patterns={patterns} />
      </div>
    </>
  )
}
