"use client"

import { useMemo, useState } from "react"
import { PatternCard } from "@/components/pattern-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { categoryLabel } from "@/lib/labels"
import type { Pattern } from "@/lib/patterns"

const SIGNIFICANCE_TABS = [
  { key: "all", label: "Todos" },
  { key: "high", label: "Alta confianza" },
  { key: "medium", label: "Media" },
  { key: "low", label: "Baja" },
] as const

const SORT_OPTIONS = [
  { value: "composite", label: "Valor (z × edge)" },
  { value: "rate", label: "Frecuencia" },
  { value: "z", label: "Z-score" },
  { value: "edge", label: "Edge medio" },
  { value: "sample", label: "Muestra" },
] as const

const CATEGORIES = [
  "all",
  "goals",
  "btts",
  "result",
  "corners",
  "cards",
  "shots",
  "player_shots",
] as const

export function PatternsBrowser({ patterns }: { patterns: Pattern[] }) {
  const [significance, setSignificance] = useState<string>("all")
  const [category, setCategory] = useState<string>("all")
  const [sort, setSort] = useState<string>("composite")
  const [minSample, setMinSample] = useState<string>("all")

  const filtered = useMemo(() => {
    let list = patterns

    if (significance !== "all") list = list.filter((p) => p.significance === significance)
    if (category !== "all") list = list.filter((p) => p.category === category)
    if (minSample !== "all") {
      const min = Number(minSample)
      list = list.filter((p) => p.total >= min)
    }

    return [...list].sort((a, b) => {
      switch (sort) {
        case "rate":
          return b.rate - a.rate
        case "z":
          return b.zScore - a.zScore
        case "edge":
          return b.avgEdge - a.avgEdge
        case "sample":
          return b.total - a.total
        default:
          return b.zScore * b.avgEdge - a.zScore * a.avgEdge
      }
    })
  }, [patterns, significance, category, sort, minSample])

  const usedCategories = [...new Set(patterns.map((p) => p.category))]

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Significance tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {SIGNIFICANCE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setSignificance(t.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                significance === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 sm:ml-auto">
          {/* Category filter */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {usedCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Min sample */}
          <Select value={minSample} onValueChange={setMinSample}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Muestra mín." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier muestra</SelectItem>
              <SelectItem value="5">Mín. 5</SelectItem>
              <SelectItem value="10">Mín. 10</SelectItem>
              <SelectItem value="20">Mín. 20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} patrón{filtered.length !== 1 ? "es" : ""} encontrado
        {filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PatternCard key={p.id} pattern={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No hay patrones que coincidan con los filtros.
        </p>
      )}
    </div>
  )
}
