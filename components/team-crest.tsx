import { crestColor } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Team } from "@/lib/types"

export function TeamCrest({
  team,
  size = "md",
  className,
}: {
  team: Pick<Team, "id" | "name" | "short_name">
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizes = {
    sm: "size-6 text-[10px]",
    md: "size-9 text-xs",
    lg: "size-12 text-sm",
  }
  const label = team.short_name ?? team.name.slice(0, 3).toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-bold uppercase text-white",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: crestColor(team.id) }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}
