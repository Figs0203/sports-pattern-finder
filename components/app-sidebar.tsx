"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CalendarDays, LayoutDashboard, LineChart, Sparkles, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { SyncButton } from "@/components/sync-button"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matches", label: "Partidos", icon: CalendarDays },
  { href: "/players", label: "Jugadores", icon: Users },
  { href: "/patterns", label: "Patrones", icon: Sparkles },
  { href: "/backtesting", label: "Backtesting", icon: LineChart },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-16 flex-col border-r border-sidebar-border bg-sidebar md:w-60">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BarChart3 className="size-5" />
        </div>
        <div className="hidden md:block">
          <p className="font-semibold leading-tight text-sidebar-foreground">GolValue</p>
          <p className="text-xs text-muted-foreground">Análisis de valor</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <SyncButton compact />
          <p className="hidden md:block text-xs text-muted-foreground leading-tight">
            Sincronizar datos
          </p>
        </div>
        <p className="mt-1.5 hidden md:block text-[10px] text-muted-foreground/50 leading-relaxed">
          13 ligas · Mundial 2026 incluido
        </p>
      </div>
    </aside>
  )
}
