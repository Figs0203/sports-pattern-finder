import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: LucideIcon
  label: string
  value: string | number
  tone?: "default" | "primary" | "destructive"
}) {
  const tones = {
    default: "text-foreground",
    primary: "text-primary",
    destructive: "text-destructive",
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <p className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums", tones[tone])}>
        {value}
      </p>
    </div>
  )
}
