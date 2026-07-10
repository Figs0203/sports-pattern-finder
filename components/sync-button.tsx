"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SyncResult {
  fixtures: number
  teams: number
  leagues: number
  odds: number
  evaluation?: { evaluated: number; inserted: number }
  errors: string[]
}

export function SyncButton({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<SyncResult | null>(null)
  const router = useRouter()

  async function handleSync() {
    if (state === "loading") return
    setState("loading")
    setResult(null)
    try {
      const res = await fetch("/api/sync?provider=all")
      const data: SyncResult = await res.json()
      setResult(data)
      setState(data.errors.length === 0 ? "success" : "error")
      // Refresh the page data after sync
      router.refresh()
    } catch {
      setState("error")
    } finally {
      // Return to idle after 4 seconds
      setTimeout(() => setState("idle"), 4000)
    }
  }

  const label =
    state === "loading"
      ? "Actualizando…"
      : state === "success"
      ? `✓ ${result?.fixtures ?? 0} partidos`
      : state === "error"
      ? "Error al sync"
      : "Actualizar datos"

  if (compact) {
    // Compact mode: just the icon, used in sidebar
    return (
      <button
        onClick={handleSync}
        disabled={state === "loading"}
        title={label}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-all",
          state === "loading" && "cursor-not-allowed opacity-60",
          state === "success" && "bg-emerald-500/20 text-emerald-400",
          state === "error" && "bg-destructive/20 text-destructive",
          state === "idle" && "hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground",
        )}
      >
        <RefreshCw
          className={cn("size-4", state === "loading" && "animate-spin")}
        />
      </button>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        id="sync-button"
        onClick={handleSync}
        disabled={state === "loading"}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
          state === "loading" &&
            "cursor-not-allowed border-border bg-muted text-muted-foreground",
          state === "success" &&
            "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
          state === "error" &&
            "border-destructive/40 bg-destructive/10 text-destructive",
          state === "idle" &&
            "border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
        )}
      >
        <RefreshCw
          className={cn("size-3.5", state === "loading" && "animate-spin")}
        />
        {label}
      </button>

      {/* Inline result summary */}
      {result && state === "success" && (
        <p className="text-right text-[10px] text-muted-foreground leading-tight">
          {result.leagues} ligas · {result.teams} equipos
          {result.evaluation
            ? ` · ${result.evaluation.inserted} oportunidades`
            : ""}
        </p>
      )}
      {result && state === "error" && result.errors.length > 0 && (
        <p className="text-right text-[10px] text-destructive leading-tight max-w-[180px] truncate">
          {result.errors[0]}
        </p>
      )}
    </div>
  )
}
