import { CheckCircle2, Database, Plug } from "lucide-react"
import type { ProviderStatus } from "@/lib/providers"
import { cn } from "@/lib/utils"

export function ProviderStatusBanner({ providers }: { providers: ProviderStatus[] }) {
  const allConfigured = providers.every((p) => p.configured)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        allConfigured ? "border-primary/30 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            allConfigured ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {allConfigured ? <CheckCircle2 className="size-5" /> : <Database className="size-5" />}
        </div>
        <div>
          <p className="text-sm font-medium">
            {allConfigured ? "Fuentes de datos en vivo activas" : "Modo datos de ejemplo"}
          </p>
          <p className="text-pretty text-xs text-muted-foreground">
            {allConfigured
              ? "Las APIs están conectadas. Sincroniza para traer datos reales."
              : "Añade las API keys para activar la ingesta de datos reales. La app ya funciona con datos de ejemplo."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <span
            key={p.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset",
              p.configured
                ? "bg-primary/10 text-primary ring-primary/30"
                : "bg-muted text-muted-foreground ring-border",
            )}
          >
            <Plug className="size-3.5" />
            {p.name}
            <span className="opacity-60">{p.configured ? "activa" : p.envVar}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
